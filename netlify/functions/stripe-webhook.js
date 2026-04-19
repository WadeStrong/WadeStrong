// ============================================================
// WADE STRONG — STRIPE WEBHOOK
// Deploy as a Netlify Function or Cloudflare Worker
// File path: netlify/functions/stripe-webhook.js
// ============================================================
// Environment variables needed (set in Netlify/Cloudflare dashboard):
//   STRIPE_SECRET_KEY        — from Stripe dashboard
//   STRIPE_WEBHOOK_SECRET    — from Stripe webhook settings
//   SUPABASE_URL             — your Supabase project URL
//   SUPABASE_SERVICE_KEY     — service role key (not anon key)
// ============================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service role bypasses RLS
);

// Map Stripe price IDs to program types and weeks
// Replace these with your actual Stripe price IDs
const PRICE_MAP = {
  'price_GET_STRONG_ID':  { type: 'get_strong',  weeks: 6,  label: 'Get Strong' },
  'price_PRE_COMP_ID':    { type: 'pre_comp',    weeks: 8,  label: 'Pre-Comp Build Up' },
};

exports.handler = async (event) => {

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Verify the webhook came from Stripe
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook error: ${err.message}` };
  }

  // Only handle successful payments
  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: 'Ignored event type' };
  }

  const session = stripeEvent.data.object;

  try {
    // Get customer details
    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = session.customer_details?.name || '';
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Get price ID from line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    const program = PRICE_MAP[priceId];

    if (!program) {
      console.error('Unknown price ID:', priceId);
      return { statusCode: 200, body: 'Unknown price ID — client not created' };
    }

    // Check if client already exists (e.g. repurchase)
    const { data: existing } = await db
      .from('clients')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (existing) {
      // Update existing client with new program
      await db
        .from('clients')
        .update({
          program_type: program.type,
          total_weeks: program.weeks,
          status: 'new',
          current_week: 0,
          stripe_payment_id: session.payment_intent,
          amount_paid: session.amount_total / 100,
          paid_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      console.log(`Updated existing client: ${customerEmail}`);
    } else {
      // Create new client record
      const { error: insertError } = await db
        .from('clients')
        .insert({
          email: customerEmail,
          first_name: firstName,
          last_name: lastName,
          program_type: program.type,
          total_weeks: program.weeks,
          status: 'new',
          stripe_customer_id: session.customer,
          stripe_payment_id: session.payment_intent,
          amount_paid: session.amount_total / 100,
          paid_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
      console.log(`Created new client: ${customerEmail} — ${program.label}`);
    }

    // Create Supabase auth user so they can log into the portal
    const { error: authError } = await db.auth.admin.createUser({
      email: customerEmail,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        program_type: program.type,
      }
    });

    // Ignore "user already exists" error
    if (authError && authError.code !== 'email_exists') {
      console.error('Auth user creation error:', authError);
    }

    // Redirect URL for after payment — questionnaire based on program type
    const questionnaireUrl = program.type === 'pre_comp'
      ? `https://wadestrong.com.au/questionnaire-precomp.html?email=${encodeURIComponent(customerEmail)}`
      : `https://wadestrong.com.au/questionnaire-get-strong.html?email=${encodeURIComponent(customerEmail)}`;

    console.log(`Webhook processed successfully for ${customerEmail}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        received: true,
        client: customerEmail,
        program: program.label,
        redirect: questionnaireUrl,
      })
    };

  } catch (err) {
    console.error('Webhook processing error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

// ============================================================
// WADE STRONG — EMAIL SENDER
// Deploy as: netlify/functions/send-email.js
// ============================================================
// Environment variables needed:
//   RESEND_API_KEY — from resend.com dashboard
//   FROM_EMAIL     — info@wadestrong.com.au
// ============================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'info@wadestrong.com.au';
const FROM_NAME = 'Wade Blackburn — Wade Strong';
const SITE_URL = 'https://wadestrong.com.au';

// ── EMAIL TEMPLATES ──────────────────────────────────────────

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Wade Strong</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f2ee; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
  .card { background: #ffffff; border-radius: 6px; overflow: hidden; }
  .header { background: #1a1a1a; padding: 32px 40px; }
  .header-logo { font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #f5f0e0; text-transform: uppercase; }
  .header-logo span { color: #B85A30; }
  .header-tag { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 4px; }
  .body { padding: 40px; }
  .greeting { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; line-height: 1.3; }
  .text { font-size: 15px; color: #4a4a4a; line-height: 1.8; margin-bottom: 16px; }
  .btn { display: inline-block; background: #B85A30; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 15px; font-weight: 700; margin: 8px 0; letter-spacing: 0.5px; }
  .btn-dark { background: #1a1a1a; }
  .divider { border: none; border-top: 1px solid #e8e4dc; margin: 28px 0; }
  .info-box { background: #f5f2ee; border-radius: 5px; padding: 20px 24px; margin: 24px 0; }
  .info-box-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #B85A30; margin-bottom: 12px; }
  .info-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; border-bottom: 1px solid #e8e4dc; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #888; }
  .info-val { font-weight: 600; color: #1a1a1a; }
  .step { display: flex; gap: 16px; margin-bottom: 20px; align-items: flex-start; }
  .step-num { background: #1a1a1a; color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
  .step-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .step-content p { font-size: 14px; color: #666; line-height: 1.6; }
  .footer { background: #1a1a1a; padding: 24px 40px; }
  .footer-text { font-size: 12px; color: rgba(255,255,255,0.3); line-height: 1.7; }
  .footer-text a { color: rgba(255,255,255,0.4); text-decoration: none; }
  .accent { color: #B85A30; font-weight: 700; }
  .vip-badge { display: inline-block; background: #B85A30; color: white; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; margin-bottom: 16px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="header-logo">WADE<span>.</span>STRONG</div>
      <div class="header-tag">International Strongman Coaching</div>
    </div>
    ${content}
    <div class="footer">
      <div class="footer-text">
        Wade Strong Coaching · Brisbane, Australia<br>
        <a href="${SITE_URL}">wadestrong.com.au</a> · <a href="mailto:info@wadestrong.com.au">info@wadestrong.com.au</a><br><br>
        You're receiving this because you purchased a coaching program from Wade Strong.
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

// EMAIL 1: Payment confirmed
function emailPaymentConfirmed({ firstName, program, amount }) {
  return baseTemplate(`
    <div class="body">
      <div class="greeting">You're in, ${firstName}. Let's get to work.</div>
      <p class="text">Payment confirmed — welcome to Wade Strong. Wade will personally review your details and be in touch within 24 hours.</p>
      <p class="text">First things first — complete your onboarding questionnaire so Wade can start building your program around <em>you</em>.</p>

      <div style="text-align:center;margin:28px 0">
        <a href="${SITE_URL}/questionnaire-get-strong.html" class="btn">Complete my questionnaire →</a>
      </div>

      <div class="info-box">
        <div class="info-box-title">Your order</div>
        <div class="info-row"><span class="info-label">Program</span><span class="info-val">${program}</span></div>
        <div class="info-row"><span class="info-label">Amount paid</span><span class="info-val">A$${amount}</span></div>
        <div class="info-row"><span class="info-label">Coach</span><span class="info-val">Wade Blackburn</span></div>
      </div>

      <hr class="divider">
      <p class="text" style="font-size:14px;color:#888">Questions? Reply to this email or message Wade directly at <a href="mailto:info@wadestrong.com.au" style="color:#B85A30">info@wadestrong.com.au</a></p>
    </div>`);
}

// EMAIL 2: Questionnaire received
function emailQuestionnaireReceived({ firstName }) {
  return baseTemplate(`
    <div class="body">
      <div class="greeting">Got it, ${firstName}. Wade's on it.</div>
      <p class="text">Your questionnaire is in. Wade will review your details before your first session — in the meantime, your next step is completing your RPE testing.</p>
      <p class="text">RPE testing gives Wade the numbers he needs to build your program at exactly the right intensity. It takes about 60–90 minutes at your gym.</p>

      <div style="text-align:center;margin:28px 0">
        <a href="${SITE_URL}/rpe10-nextsteps.html" class="btn">See RPE testing instructions →</a>
      </div>

      <div class="info-box">
        <div class="info-box-title">What happens next</div>
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h4>Complete RPE testing</h4>
            <p>Follow the instructions on the next steps page to test your key lifts. Take your time — accuracy matters more than speed.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h4>Submit your results</h4>
            <p>Log your numbers using the RPE form. Wade gets notified the moment you submit.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>Wade builds your program</h4>
            <p>Within 24 hours of receiving your RPE results, Wade will have your program ready to go.</p>
          </div>
        </div>
      </div>
    </div>`);
}

// EMAIL 3: RPE submitted
function emailRpeSubmitted({ firstName }) {
  return baseTemplate(`
    <div class="body">
      <div class="greeting">Numbers received, ${firstName}. Program incoming.</div>
      <p class="text">Wade has your RPE testing results. He'll review your numbers and build your personalised program within <span class="accent">24 hours</span>.</p>
      <p class="text">Once your program is ready you'll receive an email with your client portal link and VIP access code. That's where everything lives — your sessions, progress tracking, clips and messaging with Wade.</p>

      <div class="info-box">
        <div class="info-box-title">What Wade is building</div>
        <div class="step">
          <div class="step-num" style="background:#B85A30">✓</div>
          <div class="step-content">
            <h4>Questionnaire reviewed</h4>
            <p>Goals, injuries, schedule, gym setup — all factored in.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num" style="background:#B85A30">✓</div>
          <div class="step-content">
            <h4>RPE results logged</h4>
            <p>Your baseline numbers are in. Wade will program around these week by week.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>Program being built — in progress</h4>
            <p>6 weeks of sessions, sets, reps and RPE targets. Built specifically for you.</p>
          </div>
        </div>
      </div>

      <p class="text" style="font-size:14px;color:#888">Sit tight — Wade will be in touch within 24 hours. If you have any questions in the meantime, reply to this email.</p>
    </div>`);
}

// EMAIL 4: Program ready (Wade triggers manually)
function emailProgramReady({ firstName, portalLink, vipCode }) {
  return baseTemplate(`
    <div class="body">
      <div class="vip-badge">⚡ VIP Member</div>
      <div class="greeting">Your program is live, ${firstName}.</div>
      <p class="text">Wade has built your 6-week program and it's ready to go. Log into your client portal to see your sessions, track your progress and message Wade directly.</p>

      <div style="text-align:center;margin:28px 0">
        <a href="${portalLink || SITE_URL + '/client-portal.html'}" class="btn">Open my program →</a>
      </div>

      <div class="info-box">
        <div class="info-box-title">Your VIP access</div>
        <div class="info-row"><span class="info-label">Portal link</span><span class="info-val"><a href="${portalLink || SITE_URL + '/client-portal.html'}" style="color:#B85A30">client portal</a></span></div>
        <div class="info-row"><span class="info-label">VIP access code</span><span class="info-val">${vipCode || 'WADESTRONG'}</span></div>
        <div class="info-row"><span class="info-label">RPE calculator</span><span class="info-val"><a href="${SITE_URL}/rpe-calculator.html" style="color:#B85A30">VIP tool</a></span></div>
        <div class="info-row"><span class="info-label">VIP store</span><span class="info-val"><a href="${SITE_URL}/vip-store.html" style="color:#B85A30">members store</a></span></div>
      </div>

      <div class="info-box" style="border-left:3px solid #B85A30;border-radius:0 5px 5px 0;background:#fff9f6">
        <div class="info-box-title">A note from Wade</div>
        <p style="font-size:14px;color:#4a4a4a;line-height:1.8">I've built this program around your numbers and your goals. Trust the process, follow the RPE targets and reach out any time you have questions. Let's get to work. — <strong>Wade</strong></p>
      </div>

      <hr class="divider">
      <p class="text" style="font-size:13px;color:#888">Your VIP access code also unlocks the RPE calculator and the VIP store — use it on any page that asks for a code.</p>
    </div>`);
}

// EMAIL 5: Athlete accepted
function emailAthleteAccepted({ firstName, note }) {
  return baseTemplate(`
    <div class="body">
      <div class="greeting">You're in, ${firstName}. Welcome to the team.</div>
      <p class="text">Wade has reviewed your application and you've been accepted into the Pre-Comp Build Up program. This is a serious program for serious athletes — and Wade is serious about getting you to the start line in the best shape of your life.</p>

      ${note ? `<div class="info-box" style="border-left:3px solid #B85A30;border-radius:0 5px 5px 0;background:#fff9f6">
        <div class="info-box-title">A note from Wade</div>
        <p style="font-size:14px;color:#4a4a4a;line-height:1.8">${note}</p>
      </div>` : ''}

      <div class="info-box">
        <div class="info-box-title">What happens next</div>
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h4>Complete payment</h4>
            <p>Your program fee of A$1,200 secures your spot. Wade only takes a limited number of pre-comp athletes per block.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h4>RPE testing</h4>
            <p>Complete your RPE testing session and submit your numbers. Wade will use these to set your training intensities.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>Program build</h4>
            <p>Wade builds your comp-specific program around your events, your timeline and your numbers.</p>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin:28px 0">
        <a href="https://buy.stripe.com/aFa5kw43jdvh2C316328800" class="btn">Complete payment — A$1,200 →</a>
      </div>

      <hr class="divider">
      <p class="text" style="font-size:14px;color:#888">Questions? Reply directly to this email and Wade will get back to you personally.</p>
    </div>`);
}

// EMAIL 6: Athlete declined
function emailAthleteDeclined({ firstName }) {
  return baseTemplate(`
    <div class="body">
      <div class="greeting">Thanks for applying, ${firstName}.</div>
      <p class="text">Wade has carefully reviewed your application for the Pre-Comp Build Up program. Unfortunately he's not able to take you on for this competition block — this is usually due to timing, the number of athletes he can take on at once, or wanting to make sure the fit is right.</p>
      <p class="text">This isn't a door closed permanently. Wade is selective because he wants to give every athlete the attention they deserve — and sometimes the timing just isn't right.</p>

      <div class="info-box">
        <div class="info-box-title">Other options</div>
        <div class="step">
          <div class="step-num">→</div>
          <div class="step-content">
            <h4>Get Strong program</h4>
            <p>Wade's 6-week online coaching program is open to all levels. A great way to build your foundation and work directly with Wade before your next competition.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">→</div>
          <div class="step-content">
            <h4>Book a consult call</h4>
            <p>A 15-minute call with Wade to talk through your goals and figure out the best path forward.</p>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin:28px 0">
        <a href="https://wadestrong.com.au/#programs" class="btn btn-dark">See other programs →</a>
      </div>

      <p class="text" style="font-size:14px;color:#888">Feel free to reply to this email if you have any questions — Wade reads every response personally.</p>
    </div>`);
}

// ── SEND FUNCTION ─────────────────────────────────────────────

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
  return await res.json();
}

// ── MAIN HANDLER ──────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { type, to, data } = payload;

  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: 'RESEND_API_KEY not configured' };
  }

  try {
    let subject, html;

    switch (type) {
      case 'payment_confirmed':
        subject = `You're in, ${data.firstName} — welcome to Wade Strong`;
        html = emailPaymentConfirmed(data);
        break;

      case 'questionnaire_received':
        subject = `Got your questionnaire, ${data.firstName} — next step inside`;
        html = emailQuestionnaireReceived(data);
        break;

      case 'rpe_submitted':
        subject = `RPE results received — program incoming, ${data.firstName}`;
        html = emailRpeSubmitted(data);
        break;

      case 'program_ready':
        subject = `Your program is live, ${data.firstName} — let's go`;
        html = emailProgramReady(data);
        break;

      case 'athlete_accepted':
        subject = `You're in, ${data.firstName} — welcome to the Pre-Comp program`;
        html = emailAthleteAccepted(data);
        break;

      case 'athlete_declined':
        subject = `Your Pre-Comp application — Wade Strong`;
        html = emailAthleteDeclined(data);
        break;

      default:
        return { statusCode: 400, body: `Unknown email type: ${type}` };
    }

    const result = await sendEmail(to, subject, html);
    return { statusCode: 200, body: JSON.stringify({ sent: true, id: result.id, type }) };

  } catch (err) {
    console.error('Email send error:', err);
    return { statusCode: 500, body: err.message };
  }
};

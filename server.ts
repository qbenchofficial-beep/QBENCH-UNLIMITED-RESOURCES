import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable highly-compliant CORS controls to ensure all external clients can leverage our API endpoints
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Ensure the data directory exists for database / file storage
const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Interactive SMTP Diagnostics and Connection Handshake Testing Route
app.get('/api/smtp-test', async (req, res) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;

  console.log('🔍 [SMTP Test Requested] Running network handshake test...');
  console.log(' - SMTP_HOST:', smtpHost || 'Missing');
  console.log(' - SMTP_USER:', smtpUser || 'Missing');
  console.log(' - SMTP_PORT:', smtpPort);

  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(400).json({
      success: false,
      error: 'SMTP configurations are incomplete or missing in the env. Please specify SMTP_HOST, SMTP_USER, and SMTP_PASS.',
      smtpHost: smtpHost || 'Missing',
      smtpUser: smtpUser || 'Missing',
      smtpPassProvided: !!smtpPass
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000
    });

    console.log('🔌 [SMTP Test] Sending greeting protocol handshake to', smtpHost);
    await transporter.verify();
    console.log('✅ [SMTP Test Succeeded] Connection test OK. Credentials verified!');

    return res.status(200).json({
      success: true,
      message: 'SMTP handshake and credentials authenticated successfully!',
      details: {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        ssl: smtpPort === 465
      }
    });
  } catch (err: any) {
    console.error('❌ [SMTP Test Failed] Handshake error:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'SMTP handshaking error',
      code: err?.code,
      command: err?.command,
      advice: smtpUser?.includes('gmail.com') 
        ? 'Since you are using Gmail, make sure you are using a 16-character GMAIL APP PASSWORD from Google Account settings, rather than your standard personal gmail password. Also ensure 2-Step verification is enabled.'
        : 'Double check host, port, credentials, and local firewall parameters.'
    });
  }
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  console.log('📥 [API Request Received] POST /api/contact initiated.');
  console.log('[Received Headers]:', req.headers['content-type']);
  console.log('[Received Payload Body]:', JSON.stringify(req.body, null, 2));

  try {
    const { 
      fullName, name, from_name,
      businessName, company,
      phoneNumber, phone,
      emailAddress, email, reply_to,
      to, recipient_email,
      subject, emailSubject,
      message, emailText, emailHtml
    } = req.body;

    // Standard fallback mapping to ensure maximum backwards/forwards API compatibility
    const finalName = fullName || name || from_name || 'Anonymous Visitor';
    const finalEmail = emailAddress || email || reply_to || 'no-reply@qbench.in';
    const finalPhone = phoneNumber || phone || 'Not specified';
    const finalCompany = businessName || company || 'Not specified';
    const finalSubject = subject || emailSubject || 'General Inquiry';
    const finalMessage = message || emailText || emailHtml;
    const finalTo = to || recipient_email || 'qbench.official@gmail.com';

    // Verify critical values
    if (!finalName || !finalEmail || !finalMessage) {
      console.warn('⚠️ [Validation Failed] Missing sender name, email, or message text fields:', { finalName, finalEmail, hasMessage: !!finalMessage });
      return res.status(400).json({ 
        success: false, 
        error: 'Incomplete message data. Sender Name, Email, and Message text fields are all required.' 
      });
    }

    const newMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      fullName: finalName,
      businessName: finalCompany,
      phoneNumber: finalPhone,
      emailAddress: finalEmail,
      subject: finalSubject,
      message: finalMessage,
      routedTo: finalTo
    };

    // 1. Keep a permanent copy of the message in server storage
    let messages = [];
    if (fs.existsSync(MESSAGES_FILE)) {
      try {
        const fileContent = fs.readFileSync(MESSAGES_FILE, 'utf-8');
        messages = JSON.parse(fileContent);
      } catch (err) {
        console.error('Error reading messages file, resetting...', err);
      }
    }
    messages.push(newMessage);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
    console.log(`[Backup Saved] Submissions saved to filesystem: ${finalName} (${finalEmail})`);

    // 2. Prepare Email Material
    const mailSubject = finalSubject ? `[Q BENCH Portal] ${finalSubject}` : `[Q BENCH Portal] New inquiry from ${finalName}`;
    const mailText = `New inquiry received on Q BENCH:

Full Name: ${finalName}
Business Name: ${finalCompany}
Phone Number: ${finalPhone}
Email Address: ${finalEmail}
Date Received: ${newMessage.timestamp}
Routed To: ${finalTo}

Message:
---------------------------
${finalMessage}
---------------------------`;

    const mailHtml = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ecebea; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #00685b; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Q BENCH PORTAL</h2>
          <span style="font-size: 10px; color: #00685b; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;">Inbound Contact Message</span>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #4e4e4e; margin-bottom: 20px;">
          A customer just sent a new message using your website's contact form.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr style="background-color: #faf9f9;">
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-weight: bold; width: 140px; font-size: 12px; color: #6e6e6e; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #1e1e1e; font-weight: 600;">${finalName}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-weight: bold; font-size: 12px; color: #6e6e6e; text-transform: uppercase; letter-spacing: 0.5px;">Company/Business</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #1e1e1e;">${finalCompany}</td>
          </tr>
          <tr style="background-color: #faf9f9;">
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-weight: bold; font-size: 12px; color: #6e6e6e; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #1e1e1e; font-weight: 600;">${finalPhone}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-weight: bold; font-size: 12px; color: #6e6e6e; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #00685b; font-weight: 600;">
              <a href="mailto:${finalEmail}" style="color: #00685b; text-decoration: none;">${finalEmail}</a>
            </td>
          </tr>
          <tr style="background-color: #faf9f9;">
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-weight: bold; font-size: 12px; color: #6e6e6e; text-transform: uppercase; letter-spacing: 0.5px;">Subject</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #1e1e1e;">${finalSubject}</td>
          </tr>
        </table>
        
        <div style="background-color: #05211c; border-radius: 12px; padding: 20px; color: #ffffff; margin-top: 24px;">
          <span style="font-size: 10px; color: #88f8c5; font-weight: 800; letter-spacing: 1px; uppercase; display: block; margin-bottom: 8px;">MESSAGE BODY</span>
          <p style="font-size: 13px; line-height: 1.6; color: #e1f0ec; margin: 0; white-space: pre-wrap;">${finalMessage}</p>
        </div>
        
        <div style="text-align: center; margin-top: 24px; border-top: 1px solid #ecebea; padding-top: 16px;">
          <p style="font-size: 11px; color: #a1a09e; margin: 0;">
            Received dynamically at ${new Date(newMessage.timestamp).toLocaleString()} • Powered by Q BENCH Portal Server.
          </p>
        </div>
      </div>
    `;

    // 3. Send real email using SMTP Transporter if configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
      console.log('📡 [SMTP Connection Initializing] Connecting to server side credentials:');
      console.log(' - Host:', smtpHost, 'Port:', smtpPort, 'Service User:', smtpUser);

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // True for 465 SSL, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        connectionTimeout: 10000, // 10 seconds connection timeout
        greetingTimeout: 10000,   // 10 seconds greeting timeout
        socketTimeout: 10000      // 10 seconds socket inactivity timeout
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || smtpUser,
        to: finalTo,
        replyTo: finalEmail,
        subject: mailSubject,
        text: mailText,
        html: mailHtml
      };

      console.log('⏳ [SMTP verification handshake] Confirming parameters...');
      let isVerified = false;
      try {
        await transporter.verify();
        isVerified = true;
        console.log('✅ [SMTP Host Verified] Success connecting to email service.');
      } catch (verifyErr: any) {
        console.error('⚠️ [SMTP Handshake Issue] Pre-verification failed:', verifyErr?.message || verifyErr);
      }

      console.log('⏳ [SMTP sendMail Started] Dispatching message...');
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [SMTP Send Succeeded] Response details:');
        console.log(' - MessageID:', info.messageId);
        console.log(' - SMTP Server Response:', info.response);
        console.log(' - Accepted:', info.accepted);
        console.log(' - Rejected:', info.rejected);

        return res.status(200).json({
          success: true,
          message: 'Inquiry received and routed to your mailbox successfully!',
          details: {
            messageId: info.messageId,
            smtpResponse: info.response,
            smtpVerified: isVerified
          }
        });
      } catch (smtpErr: any) {
        console.error('❌ [SMTP Send Failed] Error occurred during dispatch:');
        console.error(' - Message:', smtpErr?.message);
        console.error(' - SMTP Code:', smtpErr?.code);
        console.error(' - Response received:', smtpErr?.response);

        return res.status(200).json({
          success: true,
          message: 'Inquiry received and saved securely on local server database, but Gmail SMTP routing failed.',
          error: smtpErr?.message || 'SMTP transaction failure',
          smtpCode: smtpErr?.code,
          smtpVerified: isVerified,
          advice: smtpUser?.includes('gmail.com') 
            ? 'Since you are using Gmail, make sure you are using a 16-character GMAIL APP PASSWORD from Google Account settings, rather than your standard personal gmail password. Also ensure 2-Step verification is enabled.'
            : 'Check host server settings.'
        });
      }
    } else {
      // Return beautiful success feedback even if local developers are testing without SMTP credentials
      console.warn(`⚠️ [SMTP Ignored] SMTP credentials are not fully configured in your .env secrets.`);
      console.log(`[Backup Saved] Submissions have been logged to local messages database successfully.`);
      return res.status(200).json({ 
        success: true, 
        message: 'Inquiry received successfully! Saved to server storage (SMTP config is pending).',
        smtpConfigured: false
      });
    }

  } catch (error: any) {
    console.error('❌ [Server Exception Caught] Error processing api/contact:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error processing report.',
      details: error?.message || 'Unknown server exception'
    });
  }
});

// Admin-level review panel route to view saved submissions securely
app.get('/api/messages', (req, res) => {
  const secret = req.query.secret;
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized access. ADMIN_SECRET mismatch.' });
  }

  if (fs.existsSync(MESSAGES_FILE)) {
    try {
      const fileContent = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      return res.status(200).json({ success: true, messages: JSON.parse(fileContent) });
    } catch {
      return res.status(500).json({ success: false, error: 'Error pulling files.' });
    }
  }
  return res.status(200).json({ success: true, messages: [] });
});

// Server configuration function
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Q BENCH Server] Running on http://localhost:${PORT}`);
  });
}

startServer();

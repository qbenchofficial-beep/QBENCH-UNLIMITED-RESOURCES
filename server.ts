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

// Ensure the data directory exists for database / file storage
const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { fullName, businessName, phoneNumber, emailAddress, subject, message } = req.body;

    if (!fullName || !phoneNumber || !emailAddress || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields (fullName, phoneNumber, emailAddress, and message are required).' 
      });
    }

    const newMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      fullName,
      businessName: businessName || '',
      phoneNumber,
      emailAddress,
      subject: subject || 'General Inquiry',
      message
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
    console.log(`[Message Saved] From: ${fullName} (${emailAddress})`);

    // 2. Prepare Email Material
    const emailSubject = subject ? `[Q BENCH Message] ${subject}` : `[Q BENCH Message] New inquiry from ${fullName}`;
    const emailText = `New Message from Q BENCH Contact Form:

Full Name: ${fullName}
Business Name: ${businessName || 'Not specified'}
Phone Number: ${phoneNumber}
Email Address: ${emailAddress}
Date Received: ${newMessage.timestamp}

Message:
---------------------------
${message}
---------------------------`;

    const emailHtml = `
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
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #1e1e1e; font-weight: 600;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-weight: bold; font-size: 12px; color: #6e6e6e; text-transform: uppercase; letter-spacing: 0.5px;">Company/Business</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #1e1e1e;">${businessName || 'Not specified'}</td>
          </tr>
          <tr style="background-color: #faf9f9;">
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-weight: bold; font-size: 12px; color: #6e6e6e; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #1e1e1e; font-weight: 600;">${phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-weight: bold; font-size: 12px; color: #6e6e6e; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #00685b; font-weight: 600;">
              <a href="mailto:${emailAddress}" style="color: #00685b; text-decoration: none;">${emailAddress}</a>
            </td>
          </tr>
          <tr style="background-color: #faf9f9;">
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-weight: bold; font-size: 12px; color: #6e6e6e; text-transform: uppercase; letter-spacing: 0.5px;">Subject</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f0ee; font-size: 13px; color: #1e1e1e;">${subject || 'General Inquiry'}</td>
          </tr>
        </table>
        
        <div style="background-color: #05211c; border-radius: 12px; padding: 20px; color: #ffffff; margin-top: 24px;">
          <span style="font-size: 10px; color: #88f8c5; font-weight: 800; letter-spacing: 1px; uppercase; display: block; margin-bottom: 8px;">MESSAGE BODY</span>
          <p style="font-size: 13px; line-height: 1.6; color: #e1f0ec; margin: 0; white-space: pre-wrap;">${message}</p>
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
      try {
        const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
        
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // True for 465 SSL, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        const mailOptions = {
          from: process.env.SMTP_FROM || smtpUser,
          to: 'qbench.official@gmail.com',
          replyTo: emailAddress,
          subject: emailSubject,
          text: emailText,
          html: emailHtml
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Sent Success] Inbound message routed to qbench.official@gmail.com`);
        return res.status(200).json({ success: true, message: 'Inquiry received and routed to owner email successfully!' });
      } catch (smtpErr: any) {
        console.error('[SMTP Transport Error] Could not dispatch email via SMTP server:', smtpErr);
        return res.status(200).json({
          success: true,
          message: 'Inquiry received and saved successfully! (SMTP processing issue)',
          smtpError: true,
          errorDetails: smtpErr?.message || 'SMTP Exception'
        });
      }
    } else {
      // Return beautiful success feedback even if local developers are testing without SMTP credentials
      console.log(`[Email Skipped] SMTP credentials missing in .env. Logged message details securely on server storage instead.`);
      return res.status(200).json({ 
        success: true, 
        message: 'Inquiry received successfully! Saved to server storage (SMTP config is pending).',
        smtpConfigured: false
      });
    }

  } catch (error: any) {
    console.error('Error handling contact API request:', error);
    return res.status(500).json({ success: false, error: 'Internal server error processing report.' });
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

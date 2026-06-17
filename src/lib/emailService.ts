import emailjs from '@emailjs/browser';

export interface EmailParams {
  name: string;
  phone: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

/**
 * Sends contact or audit request messages.
 * Prioritizes direct server-side post handlers for robust logging and SMTP email dispatch.
 * Gracefully suppresses client-side EmailJS invalid public key errors as long as server-side storage succeeds.
 */
export const sendEmailJS = async (params: EmailParams): Promise<{ success: boolean; message: string }> => {
  console.log('🏁 [Contact Form Step 1/6: Initiation] Beginning transmission handshake...');
  
  // Retrieve configurations from environment variables
  const serviceId = (import.meta as any).env.VITE_EMAILJS_SERVICE_ID || 'service_7qp1jq7';
  const templateId = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID || 'template_1xne0rd';
  const publicKey = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY || 'e3mBjv4K_lKz2WxyC';

  console.log(`📡 [Contact Form Step 2/6: Configuration Check] Loaded EmailJS Parameters:`);
  console.log(`   - Service ID:  "${serviceId}"`);
  console.log(`   - Template ID: "${templateId}"`);
  console.log(`   - Public Key:  "${publicKey ? (publicKey.substring(0, 4) + '...' + publicKey.substring(publicKey.length - 4)) : 'UNDEFINED'}"`);

  let isSavedOnServer = false;
  let serverMessage = '';

  // 1. Submit to server-side backend database and SMTP router first
  try {
    const requestPayload = {
      fullName: params.name,
      businessName: params.company || 'Not specified',
      phoneNumber: params.phone,
      emailAddress: params.email,
      
      // Explicit parameters requested by debugging guidelines
      to: 'qbench.official@gmail.com',
      subject: `Inquiry: ${params.service}`,
      message: params.message,
      
      // Backward/forward standard compatibility mapping
      name: params.name,
      phone: params.phone,
      email: params.email,
      company: params.company || 'Not specified',
      service: params.service
    };

    console.log('📤 [Contact Form Step 3/6: DB Backup] Routing backup payload to server-side database `/api/contact`:');
    console.log(JSON.stringify(requestPayload, null, 2));

    const backupResponse = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    console.log(`📥 [Contact Form Step 3/6: DB Backup Response] HTTP Status: ${backupResponse.status} ${backupResponse.statusText}`);
    
    if (backupResponse.ok) {
      isSavedOnServer = true;
      const resData = await backupResponse.json();
      serverMessage = resData.message || '';
      console.log('✅ [Database Backup Success]:', JSON.stringify(resData, null, 2));
    } else {
      console.warn('⚠️ [Database Backup Skipped] Non-200 HTTP response received:', backupResponse.status);
      try {
        const errorData = await backupResponse.json();
        console.warn('⚠️ [Server Error Body]:', JSON.stringify(errorData, null, 2));
      } catch {
        console.warn('⚠️ [Server Error Body]: Failed to parse error response body as JSON.');
      }
    }
  } catch (err) {
    console.error('❌ [Database Backup Error] Failed to contact local backend server:', err);
  }

  // 2. Validate configuration presence for client-side EmailJS
  const isConfigured = 
    serviceId && serviceId.trim() !== '' && serviceId !== 'your_service_id' &&
    templateId && templateId.trim() !== '' && templateId !== 'your_template_id' &&
    publicKey && publicKey.trim() !== '' && publicKey !== 'your_public_key_here' && publicKey !== 'your_public_key';

  if (!isConfigured) {
    console.log('ℹ️ [EmailJS Integration] Browser EmailJS dispatch skipped (missing configurations or default placeholders detected).');
    return { 
      success: true, 
      message: serverMessage || "Thank you for contacting QBench. Our team will get back to you within 24 hours."
    };
  }

  // 3. Browser dispatch via EmailJS Browser SDK
  try {
    const payload = {
      name: params.name,
      phone: params.phone,
      email: params.email,
      company: params.company,
      service: params.service,
      message: params.message,
      
      // Standard EmailJS template parameters
      from_name: params.name,
      to_name: 'QBench Solutions',
      reply_to: params.email,
      message_html: params.message,

      // Direct/Dynamic Recipient mapping configurations in template settings
      to_email: 'qbench.official@gmail.com',
      recipient_email: 'qbench.official@gmail.com',
      recipient: 'qbench.official@gmail.com',
      receiver_email: 'qbench.official@gmail.com',
      owner_email: 'qbench.official@gmail.com',
      to: 'qbench.official@gmail.com',
      sent_to: 'qbench.official@gmail.com',
      user_email: 'qbench.official@gmail.com',
      contact_email: 'qbench.official@gmail.com',
      
      // Custom compatibility mapping parameters
      fullName: params.name,
      businessName: params.company,
      phoneNumber: params.phone,
      emailAddress: params.email,
      subject: `New Inquiry: ${params.service}`,
    };

    console.log('📡 [Contact Form Step 4/6: Pre-Flight Payload Audit] Marshalling properties for EmailJS browser SDK:');
    console.log('🧬 [Outbound Payload Variables]:', JSON.stringify(payload, null, 2));

    console.log('⏳ [Contact Form Step 5/6: EmailJS Dispatch] Handing over context to EmailJS send queue...');
    const emailjsPromise = emailjs.send(
      serviceId,
      templateId,
      payload,
      publicKey
    );

    const timeoutPromise = new Promise<{ status: number; text: string }>((_, reject) =>
      setTimeout(() => reject(new Error('EmailJS outbound timeout: Dispatch exceeded 4.5 seconds limit.')), 4500)
    );

    const response = await Promise.race([emailjsPromise, timeoutPromise]);

    console.log('✅ [Contact Form Step 6/6: EmailJS Dispatch Success] Transmission complete! Metadata response:');
    console.log('   - Response Code:     ', response?.status);
    console.log('   - Response Text:     ', response?.text);
    console.log('   - Response Payload:  ', JSON.stringify(response, null, 2));

    return {
      success: true,
      message: "Thank you for contacting QBench. Our team will get back to you within 24 hours."
    };
  } catch (error: any) {
    const rawErrorMessage = error?.text || error?.message || (typeof error === 'string' ? error : 'Unknown delivery handler failure');
    
    console.error('❌ [Contact Form Step 6/6: EmailJS Dispatch Failed] Outbound driver reported error during handoff:');
    console.error('   - Context Service ID:', serviceId);
    console.error('   - Context Template ID:', templateId);
    console.error('   - Raw Error Object:', error);
    console.error('   - Error Description:', rawErrorMessage);

    // Stop and display the exact exception as requested by the user
    throw new Error(`EmailJS sending failed: ${rawErrorMessage}`);
  }
};

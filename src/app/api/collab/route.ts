import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, brand, message } = body;

        console.log("--- COLLABORATION REQUEST RECEIVED ---");
        console.log(`To: collab@rahulfitzz.com`);
        console.log(`From: ${name} (${email})`);
        console.log(`Brand: ${brand}`);
        console.log(`Message: ${message}`);
        console.log("---------------------------------------");

        // NOTE TO USER: 
        // To enable REAL mail sending, install 'resend' (npm install resend)
        // And use the following logic with your RESEND_API_KEY in .env

        /*
        import { Resend } from 'resend';
        const resend = new Resend(process.env.RESEND_API_KEY);

        // 1. Send internal notification
        await resend.emails.send({
            from: 'RahulFitzz Portfolio <onboarding@resend.dev>',
            to: 'collab@rahulfitzz.com',
            subject: `New Collab Request: ${brand}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });

        // 2. Send thank you note to user
        await resend.emails.send({
            from: 'RahulFitzz <onboarding@resend.dev>',
            to: email,
            subject: 'Thank You for Visiting RahulFitzz Portfolio',
            text: `Hi ${name},\n\nThanks for reaching out about a collaboration with ${brand}. I'll review your message and get back to you soon!\n\nBest,\nRahulFitzz`,
        });
        */

        return NextResponse.json({ success: true, message: 'Request received successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
    }
}

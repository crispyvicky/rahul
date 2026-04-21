import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, brand, message } = body;

        // 1. Send Internal Notification to RahulFitzz
        await transporter.sendMail({
            from: `"RahulFitzz Portfolio" <${process.env.SMTP_USER}>`,
            to: 'collab@rahulfitzz.com',
            subject: `New Collaboration Request from ${brand}`,
            text: `
                Name: ${name}
                Email: ${email}
                Brand/Company: ${brand}
                Details: ${message}
            `,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background: #050505; color: white; border: 1px solid #eb0000;">
                    <h2 style="color: #eb0000; text-transform: uppercase;">New Transmission Received</h2>
                    <p><strong>Partner:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Brand:</strong> ${brand}</p>
                    <hr style="border: 1px solid #222;" />
                    <p><strong>Brief:</strong></p>
                    <p>${message}</p>
                </div>
            `,
        });

        // 2. Send Automated Thank You Note to the Partner
        await transporter.sendMail({
            from: `"RahulFitzz" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Transmission Received | RahulFitzz Collaboration',
            text: `Hi ${name}, Thank you for reaching out to collaborate with RahulFitzz. We have received your brief for ${brand} and will review it shortly. Engineered for the elite.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background: #050505; color: white; text-align: center;">
                    <h1 style="color: #eb0000; text-transform: uppercase;">Mission Received.</h1>
                    <p style="font-size: 1.1rem;">Hi ${name},</p>
                    <p>Thanks for reaching out to collaborate. I've received the brief for <strong>${brand}</strong>.</p>
                    <p>My team and I will review the details and get back to you if there's a strategic alignment.</p>
                    <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #eb0000; display: inline-block;">
                        <p style="letter-spacing: 0.3em; font-weight: bold; margin: 0;">RAHULFITZZ</p>
                        <p style="font-size: 0.8rem; color: #eb0000;">THE EVOLUTION EDGE</p>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true, message: 'Transmission sent successfully' });
    } catch (error: any) {
        console.error("Nodemailer Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to process transmission' }, { status: 500 });
    }
}

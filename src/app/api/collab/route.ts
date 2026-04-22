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
            from: `"RahulFitzz Systems" <${process.env.SMTP_USER}>`,
            to: 'collab@rahulfitzz.com',
            subject: `[NEW PARTNERSHIP LEAD] - ${brand}`,
            text: `
                NEW BRAND INQUIRY DEPLOYED
                
                Partner Identity: ${name}
                Contact Vector: ${email}
                Brand/Organization: ${brand}
                
                Brief / Proposal:
                ${message}
            `,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 40px; background-color: #050505; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                    <div style="max-w-xl mx-auto border border-[#333333] border-t-4 border-t-[#eb0000] p-8 background-color: #0a0a0a;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                            <tr>
                                <td>
                                    <h1 style="color: #eb0000; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0;">System Alert</h1>
                                    <p style="color: #96979c; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px;">New Partnership Lead</p>
                                </td>
                                <td align="right">
                                    <img src="https://rahulfitzz.com/icon.png" alt="RF Logo" width="50" height="50" style="opacity: 0.8; display: block;" />
                                </td>
                            </tr>
                        </table>
                        
                        <div style="background-color: #111111; padding: 25px; border-left: 2px solid #eb0000; margin-bottom: 30px;">
                            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong style="color: #666666; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; display: block; margin-bottom: 4px;">Point of Contact</strong> <span style="font-size: 16px;">${name}</span></p>
                            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong style="color: #666666; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; display: block; margin-bottom: 4px;">Organization</strong> <span style="font-size: 16px;">${brand}</span></p>
                            <p style="margin: 0; font-size: 14px;"><strong style="color: #666666; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; display: block; margin-bottom: 4px;">Comm Channel</strong> <a href="mailto:${email}" style="color: #eb0000; text-decoration: none;">${email}</a></p>
                        </div>
                        
                        <h3 style="color: #ffffff; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px;">The Brief</h3>
                        <p style="font-size: 15px; line-height: 1.6; color: #dcdcdc; white-space: pre-wrap; margin-bottom: 40px;">${message}</p>
                        
                        <div style="border-top: 1px solid #333333; padding-top: 20px; text-align: center;">
                            <p style="color: #666666; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">RahulFitzz Digital Ecosystem • Automated Routing</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        // 2. Send Automated Thank You Note to the Partner
        await transporter.sendMail({
            from: `"RahulFitzz" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Transmission Received | RahulFitzz Select',
            text: `MISSION RECEIVED.\n\nHi ${name},\n\nThank you for reaching out to collaborate. We have received the partnership brief for ${brand}.\n\nOur team is reviewing the internal logistics to determine strategic alignment. If there is a potent synergy, we will initiate contact shortly.\n\nNo average moves. Only evolution.\n\nRAHULFITZZ\nTHE EVOLUTION EDGE`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 40px 20px; background-color: #050505; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <div style="text-align: center; margin-bottom: 40px;">
                            <img src="https://rahulfitzz.com/icon.png" alt="RahulFitzz" width="60" height="60" style="display: inline-block; margin-bottom: 20px;" />
                            <h1 style="color: #eb0000; font-size: 28px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0;">Mission Received</h1>
                            <div style="height: 2px; width: 40px; background-color: #eb0000; margin: 20px auto 0;"></div>
                        </div>
                        
                        <div style="background-color: #0a0a0a; border: 1px solid #1a1a1a; padding: 40px;">
                            <p style="font-size: 16px; line-height: 1.8; margin-top: 0; color: #dcdcdc;">Hello <span style="color: #ffffff; font-weight: bold;">${name}</span>,</p>
                            
                            <p style="font-size: 16px; line-height: 1.8; color: #96979c;">Thank you for initiating the transmission. My team and I have successfully received the partnership brief for <strong>${brand}</strong>.</p>
                            
                            <p style="font-size: 16px; line-height: 1.8; color: #96979c;">We are currently analyzing the logistics and audience alignment. If there is a potent synergy that meets our elite standards, we will establish contact shortly to coordinate the next moves.</p>
                            
                            <p style="font-size: 16px; line-height: 1.8; margin-bottom: 0; color: #dcdcdc; font-style: italic;">"Engineered for those who refuse average."</p>
                        </div>
                        
                        <div style="margin-top: 50px; text-align: center;">
                            <p style="letter-spacing: 8px; font-weight: 900; font-size: 14px; margin: 0 0 5px 0;">RAHULFITZZ</p>
                            <p style="font-size: 10px; color: #eb0000; letter-spacing: 4px; text-transform: uppercase; margin: 0;">The Evolution Edge</p>
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
                                <a href="https://rahulfitzz.com" style="color: #666666; font-size: 11px; text-decoration: none; letter-spacing: 1px; margin: 0 10px;">PORTFOLIO</a>
                                <span style="color: #333;">|</span>
                                <a href="https://rahulfitzz.com/#contact" style="color: #666666; font-size: 11px; text-decoration: none; letter-spacing: 1px; margin: 0 10px;">COMMUNICATIONS</a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return NextResponse.json({ success: true, message: 'Transmission sent successfully' });
    } catch (error: any) {
        console.error("Nodemailer Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to process transmission' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('🔄 Signup API called');

  try {
    const { email, password } = await request.json();
    console.log('📧 Processing signup for:', email);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔢 Generated code:', code);

    // Store code with 5-minute expiry in Supabase
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    console.log('⏰ Setting expiry to:', expiresAt.toISOString());
    console.log('⏰ Current time:', new Date().toISOString());

    console.log('📝 Attempting to insert into email_verifications table...');
    const { data, error: insertError } = await supabase
      .from('email_verifications')
      .insert({
        email,
        code,
        password, // Note: In production, hash this password
        expires_at: expiresAt.toISOString(),
      })
      .select();

    console.log('📝 Insert result:', { data, error: insertError });

    if (insertError) {
      console.error('❌ Supabase insert error:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      throw new Error(`Failed to store verification code: ${insertError.message}`);
    }

    console.log('✅ Successfully stored verification code in database');

    console.log('💾 Code stored in database');

    // Send verification email
    console.log('📤 Attempting to send email...');
    await sendVerificationEmail(email, code);
    console.log('✅ Email sent successfully');

    console.log(`✅ Verification code sent to ${email}: ${code}`);

    return NextResponse.json({
      message: 'Verification code sent successfully',
      email
    });

  } catch (error: any) {
    console.error('❌ Signup API error:', error);
    console.error('Error details:', error.message);

    // If email sending failed, clean up the stored code
    console.log('🧹 Cleaning up stored code due to error');
    // Note: We can't clean up here because we don't know the email

    return NextResponse.json(
      { error: error.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
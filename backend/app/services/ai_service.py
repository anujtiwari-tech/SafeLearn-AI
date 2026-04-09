from groq import Groq
from typing import List
import logging
from ..config import settings

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        """Lazy-initialize the Groq client so it doesn't crash at import when key is empty."""
        if self._client is None:
            api_key = settings.GROQ_API_KEY
            if not api_key:
                logger.error("GROQ_API_KEY is not set.")
                raise RuntimeError("GROQ_API_KEY is not set. Please add it to your .env file.")
            self._client = Groq(api_key=api_key)
        return self._client
    
    def generate_explanation(
        self, 
        threat_type: str, 
        risk_indicators: List[str],
        url: str,
        is_threat: bool = True,
        model: str = "llama3-8b-8192" # Default to lightweight for speed and reliability
    ) -> str:
        """Generate plain-English explanation for students"""
        
        is_email_env = "mail.google.com" in url or "outlook" in url or "email://" in url
        
        if is_threat:
            prompt = f"""You are a friendly cybersecurity tutor for students. 
            Analyze this potential threat and explain WHY it is suspicious.
            
            Context: {'Email Inbox' if is_email_env else 'Website'}
            Threat Type: {threat_type}
            URL: {url}
            Risk Indicators: {', '.join(risk_indicators)}
            
            Structure your response exactly like this:
            Verdict: [1-3 words, e.g. **Potential Risk** or **Security Alert**]
            Reasoning: [1-2 simple sentences explaining what looks wrong]
            Safety Tip: [1 short helpful tip for the student]"""
        else:
            prompt = f"""You are a friendly cybersecurity tutor for students. 
            Confirm why this appears safe in supportive language.
            
            URL: {url}
            Context: {'Email Inbox' if is_email_env else 'Website'}
            
            Structure your response exactly like this:
            Verdict: [1-3 words, e.g. **Verified Safe** or **Trusted Platform**]
            Reasoning: [1-2 simple sentences explaining why it looks secure]
            Safety Tip: [1 short positive cybersecurity tip]"""
        
        try:
            logger.info(f"Generating {'threat' if is_threat else 'safe'} explanation for: {url}")
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API Error: {str(e)}")
            if is_threat:
                return f"Verdict: **Suspicious**\nReasoning: This link appears suspicious. Our AI detected potential risks based on common phishing patterns.\nSafety Tip: Always double-check links before clicking!"
            else:
                return "Verdict: **Safe**\nReasoning: This platform is verified and secure for students.\nSafety Tip: Keep up the great work browsing safely!"

    def generate_privacy_summary(self, privacy_data: dict) -> str:
        """Generate ultra-fast privacy summary"""
        prompt = f"Summarize in 1 simple sentence for a student: {privacy_data}"
        try:
            response = self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=60,
                temperature=0.5
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Privacy Summary Error: {str(e)}")
            return "This app has standard privacy practices. Be mindful of what you share."

    def generate_email_explanation(
        self,
        sender_name: str,
        sender_email: str,
        subject: str,
        body_snippet: str,
        risk_indicators: List[str],
        is_threat: bool = True,
        model: str = "llama3-8b-8192"
    ) -> str:
        """Generate a personalized, educational explanation for email scans"""
        
        if is_threat:
            prompt = f"""You are a friendly cybersecurity tutor for students. 
            Analyze this email and explain WHY it is suspicious.
            
            Email Details:
            - From: {sender_name or 'Unknown'} ({sender_email})
            - Subject: {subject}
            - Body Snippet: {body_snippet}
            - Risk Indicators: {', '.join(risk_indicators)}
            
            Structure your response exactly like this:
            Verdict: [1-3 words, e.g. **Phishing Attempt** or **Suspicious Email**]
            Reasoning: [1-2 simple sentences pointing out specific red flags like the sender or urgent language]
            Safety Tip: [1 short helpful tip for the student]"""
        else:
            prompt = f"""You are a friendly cybersecurity tutor for students. 
            Explain WHY this email appears safe.
            
            Email Details:
            - From: {sender_name or 'Unknown'} ({sender_email})
            - Subject: {subject}
            
            Structure your response exactly like this:
            Verdict: [1-3 words, e.g. **Verified Email** or **Safe Sender**]
            Reasoning: [1-2 simple sentences explaining why the sender or content looks secure]
            Safety Tip: [1 short positive cybersecurity tip]"""

        try:
            logger.info(f"Generating email {'threat' if is_threat else 'safe'} explanation for {sender_email}")
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=250,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq Email Explanation Error: {str(e)}")
            # Fallback
            if is_threat:
                indicators_text = ", ".join(risk_indicators[:2]) if risk_indicators else "unusual language and links"
                return f"Verdict: **Phishing Alert**\nReasoning: This email appears to be a phishing attempt. Red flags: {indicators_text}.\nSafety Tip: Do not click any links or provide personal information!"
            else:
                return "Verdict: **Safe Email**\nReasoning: No common phishing patterns were detected in this email.\nSafety Tip: Still be careful with attachments from people you don't know."


ai_service = AIService()
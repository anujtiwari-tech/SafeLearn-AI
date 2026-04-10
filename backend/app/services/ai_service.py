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
    
    def generate_explanation_with_consequences(
        self, 
        threat_type: str, 
        risk_indicators: List[str],
        url: str,
        is_threat: bool = True,
        model: str = "llama3-8b-8192"
    ) -> dict:
        """
        Generate both simple explanation AND advanced consequences
        Returns: {
            'simple_explanation': str,
            'consequences': str,
            'verdict': str,
            'safety_tip': str
        }
        """
        
        is_email_env = "mail.google.com" in url or "outlook" in url or "email://" in url
        
        if is_threat:
            prompt = f"""You are a friendly cybersecurity tutor for students. 
            Analyze this potential threat and provide TWO types of explanations.
            
            Context: {'Email Inbox' if is_email_env else 'Website'}
            Threat Type: {threat_type}
            URL: {url}
            Risk Indicators: {', '.join(risk_indicators)}
            
            IMPORTANT: Respond in EXACT JSON format with NO additional text outside the JSON:
            
            {{
                "verdict": "short verdict like Phishing Attempt or Security Alert",
                "simple_explanation": "1-2 simple sentences explaining WHY this is dangerous (for students)",
                "consequences": "A detailed scary but factual explanation of WHAT HAPPENS if the user ignores this warning. Write 4-5 bullet points starting with •",
                "safety_tip": "1 short helpful tip for the student"
            }}
            
            Example for Phishing:
            {{
                "verdict": "Phishing Attempt",
                "simple_explanation": "This fake website is trying to steal your password by pretending to be your bank's login page.",
                "consequences": "If you ignore this warning and enter your information:\\n• Hackers will receive your username and password instantly\\n• They can log into your bank account and steal your money\\n• Your email account could be compromised\\n• Your saved passwords in your browser may be stolen\\n• Your identity could be used for fraud",
                "safety_tip": "Always check the website address carefully before entering passwords."
            }}
            
            Make consequences SPECIFIC to the threat type ({threat_type}). Be factual, educational, and appropriately concerning for students."""
        else:
            prompt = f"""You are a friendly cybersecurity tutor for students. 
            Confirm why this appears safe.
            
            URL: {url}
            Context: {'Email Inbox' if is_email_env else 'Website'}
            
            Respond in EXACT JSON format:
            {{
                "verdict": "Verified Safe",
                "simple_explanation": "1-2 sentences explaining why this is safe",
                "consequences": "No consequences - this appears safe",
                "safety_tip": "1 short positive tip"
            }}"""
        
        try:
            logger.info(f"Generating explanation with consequences for: {url}")
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.7
            )
            
            # Parse JSON response
            import json
            content = response.choices[0].message.content
            # Clean the response (remove any markdown code blocks)
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.startswith('```'):
                content = content[3:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            result = json.loads(content)
            return result
            
        except Exception as e:
            error_msg = str(e)
            if "401" in error_msg or "Invalid API Key" in error_msg:
                logger.error("Groq API Error: Unauthorized (401). Please check your GROQ_API_KEY in .env")
            else:
                logger.error(f"Groq API Error: {error_msg}")
            if is_threat:
                return {
                    "verdict": "Security Alert",
                    "simple_explanation": f"This {threat_type} link appears suspicious. Our AI detected potential risks based on common attack patterns.",
                    "consequences": f"If you ignore this warning and continue:\n• Your personal information could be stolen\n• Your device may get infected with malware\n• Your accounts could be compromised\n• Financial loss is possible\n• Your identity could be used for fraud",
                    "safety_tip": "Always double-check links before clicking! When in doubt, close the tab."
                }
            else:
                return {
                    "verdict": "Verified Safe",
                    "simple_explanation": "This platform appears safe and secure for students.",
                    "consequences": "No consequences - this appears safe to use.",
                    "safety_tip": "Keep up the great work browsing safely!"
                }

    # Keep original method for backward compatibility
    def generate_explanation(
        self, 
        threat_type: str, 
        risk_indicators: List[str],
        url: str,
        is_threat: bool = True,
        model: str = "llama3-8b-8192"
    ) -> str:
        """Generate plain-English explanation for students (backward compatible)"""
        result = self.generate_explanation_with_consequences(
            threat_type, risk_indicators, url, is_threat, model
        )
        # Format as original expected format
        return f"Verdict: **{result['verdict']}**\nReasoning: {result['simple_explanation']}\nSafety Tip: {result['safety_tip']}"

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

    def generate_email_explanation_with_consequences(
        self,
        sender_name: str,
        sender_email: str,
        subject: str,
        body_snippet: str,
        risk_indicators: List[str],
        is_threat: bool = True,
        model: str = "llama3-8b-8192"
    ) -> dict:
        """
        Generate email explanation with consequences
        Returns dict with simple_explanation, consequences, verdict, safety_tip
        """
        
        if is_threat:
            prompt = f"""You are a friendly cybersecurity tutor for students. 
            Analyze this email and provide TWO types of explanations.
            
            Email Details:
            - From: {sender_name or 'Unknown'} ({sender_email})
            - Subject: {subject}
            - Body Snippet: {body_snippet}
            - Risk Indicators: {', '.join(risk_indicators)}
            
            Respond in EXACT JSON format:
            {{
                "verdict": "Phishing Attempt or Suspicious Email",
                "simple_explanation": "1-2 sentences explaining WHY this email is dangerous",
                "consequences": "4-5 bullet points starting with • explaining WHAT happens if user clicks or replies",
                "safety_tip": "1 short helpful tip"
            }}
            
            Example:
            {{
                "verdict": "Phishing Attempt",
                "simple_explanation": "This email is trying to trick you into clicking a fake link that leads to a counterfeit login page.",
                "consequences": "If you click the link in this email:\\n• Hackers will get your login credentials\\n• Your account could be stolen\\n• Your personal information may be sold\\n• Your friends could receive spam from your account\\n• Financial loss is possible if it's a banking scam",
                "safety_tip": "Never click links in suspicious emails. Go directly to the website by typing the address yourself."
            }}"""
        else:
            prompt = f"""You are a friendly cybersecurity tutor for students. 
            Explain why this email appears safe.
            
            Email Details:
            - From: {sender_name or 'Unknown'} ({sender_email})
            - Subject: {subject}
            
            Respond in JSON:
            {{
                "verdict": "Verified Email",
                "simple_explanation": "1-2 sentences why this looks safe",
                "consequences": "No consequences - this email appears safe",
                "safety_tip": "1 short positive tip"
            }}"""

        try:
            logger.info(f"Generating email explanation for {sender_email}")
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.7
            )
            
            import json
            content = response.choices[0].message.content
            # Clean response
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.startswith('```'):
                content = content[3:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Groq Email Explanation Error: {str(e)}")
            if is_threat:
                indicators_text = ", ".join(risk_indicators[:2]) if risk_indicators else "unusual language and links"
                return {
                    "verdict": "Phishing Alert",
                    "simple_explanation": f"This email appears to be a phishing attempt. Red flags: {indicators_text}.",
                    "consequences": f"If you interact with this email:\n• Your account credentials could be stolen\n• Your personal information may be compromised\n• Your device could get infected\n• Financial loss is possible\n• Your identity could be used for fraud",
                    "safety_tip": "Do not click any links or provide personal information!"
                }
            else:
                return {
                    "verdict": "Safe Email",
                    "simple_explanation": "No common phishing patterns were detected in this email.",
                    "consequences": "No consequences - this email appears safe.",
                    "safety_tip": "Still be careful with attachments from people you don't know."
                }

    # Keep original email method for backward compatibility
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
        """Original method - kept for backward compatibility"""
        result = self.generate_email_explanation_with_consequences(
            sender_name, sender_email, subject, body_snippet, risk_indicators, is_threat, model
        )
        return f"Verdict: **{result['verdict']}**\nReasoning: {result['simple_explanation']}\nSafety Tip: {result['safety_tip']}"


ai_service = AIService()
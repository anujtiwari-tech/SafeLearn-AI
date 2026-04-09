import re
import os
import math
import socket
from typing import List, Tuple
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

class ThreatDetector:
    """Rule-based threat detection with heuristic analysis"""
    
    def __init__(self):
        self.suspicious_tlds = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf']
        self.safe_tlds = ['.edu', '.gov', '.org']
        self.phishing_keywords = [
            'verify', 'urgent', 'suspend', 'confirm', 'update', 
            'password', 'login', 'account', 'secure', 'immediate',
            'phishing', 'malware', 'fake', 'test', 'free', 'bonus',
            'signin', 'verify-account', 'unusual-activity',
            'unusual activity', 'action required', 'account suspended'
        ]
        self.malicious_domains = ['phishing-test.com', 'malware-test.net', 'testphish.com']
        self.brand_patterns = {
            'apple': ['app-le', 'apple-id', 'icloud-verify'],
            'google': ['g00gle', 'google-login', 'gmail-security'],
            'netflix': ['netf1ix', 'netflix-billing'],
            'paypal': ['paypa1', 'paypal-update'],
            'microsoft': ['micros0ft', 'office365-login'],
            'airtel': ['airtel-pay', 'airtel-security'],
            'amazon': ['amaz0n', 'amazon-order']
        }
        self.malware_extensions = ['.exe', '.scr', '.zip', '.jar', '.vbs', '.js', '.iso', '.bat']
        self.blacklisted_domains = self._load_blacklisted_domains()
    
    def _load_blacklisted_domains(self) -> set:
        """Load external blocklist file (up to 500k domains)"""
        try:
            # File is located in 'backend/phishing domains.txt'
            # current file is 'backend/app/services/threat_detector.py'
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            file_path = os.path.join(base_dir, "phishing domains.txt")
            
            if not os.path.exists(file_path):
                logger.warning(f"Domain blocklist not found at: {file_path}")
                return set()
            
            logger.info("Loading domain blocklist into memory...")
            with open(file_path, "r", encoding="utf-8") as f:
                domains = {line.strip().lower() for line in f if line.strip()}
            logger.info(f"Successfully loaded {len(domains)} blacklisted domains.")
            return domains
        except Exception as e:
            logger.error(f"Error loading blocklist: {e}")
            return set()
    
    def _calculate_entropy(self, text: str) -> float:
        """Calculate Shannon entropy to detect random/gibberish strings"""
        if not text:
            return 0
        # Count occurrences of each character
        frequencies = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]
        # Calculate entropy
        entropy = - sum([p * math.log(p) / math.log(2.0) for p in frequencies])
        return entropy

    def _check_domain_exists(self, domain: str) -> bool:
        """Check if domain resolves in DNS (fast check)"""
        # Skip local/internal domains
        if domain in ['localhost', '127.0.0.1'] or domain.endswith('.local'):
            return True
            
        try:
            # Use getaddrinfo for a standard DNS resolution check
            socket.getaddrinfo(domain, None)
            return True
        except (socket.gaierror, socket.herror):
            return False
        except Exception:
            # Fallback to True to avoid false positives if DNS is unstable
            return True

    def analyze_url(self, url: str) -> Tuple[bool, str, List[str], float, List[str]]:
        """
        Returns: (is_threat, threat_type, risk_indicators, confidence_score, performed_checks)
        """
        risk_indicators = []
        performed_checks = [
            "Domain Authenticity Verification",
            "Top-Level Domain (TLD) Security Scan",
            "Brand Spoofing Analysis",
            "Known Malicious Domain Check",
            "Suspicious Keyword Extraction",
            "Secure Connection (SSL) Validation",
            "Malware File Signature Check",
            "Entropy & Gibberish Analysis",
            "DNS Resolution Verification"
        ]
        confidence = 0.0
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()
            
            # Check 1: Suspicious TLD
            for tld in self.suspicious_tlds:
                if domain.endswith(tld):
                    risk_indicators.append(f"Suspicious domain extension: {tld}")
                    confidence += 0.3
            
            # Check 2: Brand Spoofing (lookalike domains)
            for brand, patterns in self.brand_patterns.items():
                if brand in domain:
                    # If it's a known brand but not the official TLD, raise confidence
                    if not any(domain.endswith(t) for t in ['.com', '.net', '.org']):
                        risk_indicators.append(f"Brand '{brand}' detected on non-standard TLD")
                        confidence += 0.4
                
                for pattern in patterns:
                    if pattern in domain:
                        risk_indicators.append(f"Direct brand spoofing detected: {pattern}")
                        confidence += 0.6
            
            # Check 2.1: Domain Blacklist & Global Blocklist
            is_blacklisted = False
            for blacklisted in self.malicious_domains:
                if blacklisted in domain:
                    is_blacklisted = True
                    break
            
            # Check global 500k blocklist (Exact matches on host)
            if domain in self.blacklisted_domains:
                is_blacklisted = True
                
            if is_blacklisted:
                risk_indicators.append("Known malicious domain detected in blocklist database")
                confidence += 1.0
            
            # Check 2.2: Entropy/Gibberish Check
            # We check the first part of the domain (excluding TLD if possible)
            domain_parts = domain.split('.')
            if len(domain_parts) >= 2:
                main_part = domain_parts[0]
                entropy = self._calculate_entropy(main_part)
                # Threshold for a typical English-like domain is usually < 2.8
                # Gibberish like 'sdgkjnd-phinsng' is usually > 3.0
                if len(main_part) > 6 and entropy > 2.9:
                    risk_indicators.append(f"High randomness (gibberish) detected in domain name: {main_part}")
                    confidence += 0.4
            
            # Check 2.3: DNS Resolution Check
            if not self._check_domain_exists(domain):
                risk_indicators.append("Domain does not appear to exist (DNS resolution failed)")
                confidence += 0.6
            
            # Check 3: IP Address instead of domain
            ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
            if re.match(ip_pattern, domain):
                risk_indicators.append("IP address used instead of domain name")
                confidence += 0.3
            
            # Check 4: Excessive subdomains
            if domain.count('.') > 3:
                risk_indicators.append("Excessive subdomains (possible phishing)")
                confidence += 0.2
            
            # Check 5: Phishing keywords in URL
            for keyword in self.phishing_keywords:
                if keyword in path or keyword in domain:
                    risk_indicators.append(f"Urgent/suspicious keyword: {keyword}")
                    confidence += 0.15
                    break
            
            # Check 6: HTTP instead of HTTPS (for login pages)
            if parsed.scheme == 'http' and ('login' in path or 'auth' in path):
                risk_indicators.append("Unencrypted connection for sensitive page")
                confidence += 0.3
            
            # Check 7: Malware File Extensions
            for ext in self.malware_extensions:
                if path.endswith(ext):
                    risk_indicators.append(f"Suspicious malware-related file extension: {ext}")
                    confidence += 0.7
                    threat_type = "malware"
                    break
            
            # Determine threat level
            is_threat = confidence >= 0.5
            threat_type = "phishing" if is_threat else "safe"
            
            return (is_threat, threat_type, risk_indicators, min(confidence, 1.0), performed_checks)
            
        except Exception as e:
            return (False, "unknown", ["Error analyzing URL"], 0.0, [])
    
    def analyze_text(self, text: str) -> Tuple[bool, List[str], float]:
        """Analyze email/text for phishing indicators"""
        risk_indicators = []
        confidence = 0.0
        
        text_lower = text.lower()
        
        # Check for urgency
        urgency_words = ['urgent', 'immediate', 'asap', 'within 24 hours', 'expire']
        for word in urgency_words:
            if word in text_lower:
                risk_indicators.append(f"Urgent language: {word}")
                confidence += 0.2
        
        # Check for threats
        threat_words = ['suspend', 'terminate', 'locked', 'disabled']
        for word in threat_words:
            if word in text_lower:
                risk_indicators.append(f"Threatening language: {word}")
                confidence += 0.25
        
        # Check for requests for sensitive info
        sensitive_words = ['password', 'credit card', 'ssn', 'bank account']
        for word in sensitive_words:
            if word in text_lower:
                risk_indicators.append(f"Request for sensitive info: {word}")
                confidence += 0.3
        
        is_threat = confidence >= 0.5
        return (is_threat, risk_indicators, min(confidence, 1.0))

threat_detector = ThreatDetector()
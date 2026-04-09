from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models, schemas, database, security

router = APIRouter(prefix="/api/learning", tags=["Learning Hub"])

# Mock static data for now (matches frontend rich structure)
LEARNING_MODULES = [
    {
        "id": "spot-fake-email",
        "title": "Spot the Fake Email",
        "description": "Learn to identify common phishing patterns, suspicious links, and sender spoofing.",
        "type": "Quiz",
        "duration": "2 min",
        "points": 10,
        "explanation": "Phishing emails are fake messages that try to trick you into giving away personal information like passwords or credit card numbers. They often look like they come from real companies like your bank, school, or social media platforms.\n\nThese emails usually create urgency - they might say your account will be closed or you've won a prize. The goal is to make you act quickly without thinking.\n\nHow to spot fake emails:\n• Check the sender's email address carefully\n• Hover over links before clicking to see the real URL\n• Look for spelling and grammar mistakes\n• Never share passwords or sensitive information via email\n\nIf you're unsure, contact the company directly through their official website or phone number. Never click links or download attachments from suspicious emails.",
        "keyPoints": [
            "Fake emails create urgency to trick you",
            "Always check sender email addresses",
            "Hover over links before clicking",
            "Legitimate companies don't ask for passwords via email",
            "When in doubt, contact the company directly"
        ],
        "whatYouWillLearn": [
            "Identify common phishing email red flags",
            "Verify sender authenticity",
            "Safe email handling practices"
        ]
    },
    {
        "id": "password-security",
        "title": "Password Security 101",
        "description": "Create unbreakable passwords and add an extra layer of protection to your accounts.",
        "type": "Lesson",
        "duration": "3 min",
        "points": 15,
        "explanation": "Passwords are like keys to your digital life. A weak password is like leaving your front door unlocked. Cybercriminals use automated programs that can guess millions of passwords per second.\n\nStrong passwords should be:\n• At least 12 characters long\n• Use a mix of uppercase, lowercase, numbers, and symbols\n• Never use personal information like your name or birthday\n• Different for every account\n\nInstead of remembering complex passwords, use a passphrase - a sentence that's easy to remember but hard to guess. For example: 'PurpleElephantDancesAtMidnight!'\n\nBetter yet, use a password manager. It creates and stores strong, unique passwords for all your accounts. You only need to remember one master password.\n\nEnable Two-Factor Authentication (2FA) whenever possible. This adds an extra layer of security by requiring a code from your phone in addition to your password.",
        "keyPoints": [
            "Use long passwords (12+ characters)",
            "Never reuse passwords across accounts",
            "Use a password manager",
            "Enable Two-Factor Authentication",
            "Avoid using personal information"
        ],
        "whatYouWillLearn": [
            "Create strong, memorable passwords",
            "Use password managers effectively",
            "Set up Two-Factor Authentication"
        ]
    },
    {
        "id": "ssl-certificates",
        "title": "Understanding SSL Certificates",
        "description": "Learn how web encryption protects your data on safe websites.",
        "type": "Lesson",
        "duration": "4 min",
        "points": 20,
        "explanation": "SSL (Secure Sockets Layer) certificates are digital passports that verify a website's identity and encrypt the data sent between your browser and that website. When you see a padlock icon in your browser's address bar, it means the website has a valid SSL certificate.\n\nWhy SSL matters:\n• Protects sensitive information like passwords and credit cards\n• Verifies you're connected to the real website, not a fake copy\n• Builds trust with website visitors\n• Improves search engine ranking\n\nHow to check if a website is secure:\n• Look for 'https://' at the beginning of the URL (the 's' stands for secure)\n• Click the padlock icon to see certificate details\n• Be cautious if your browser shows a 'Not Secure' warning\n\nSSL certificates use encryption to scramble data so only the intended recipient can read it. This prevents hackers from intercepting and stealing your information.\n\nNever enter personal information on websites without a valid SSL certificate. If a site lacks HTTPS, it's not safe for passwords, payments, or private data.",
        "keyPoints": [
            "Look for 'https://' and padlock icon",
            "SSL encrypts data between you and the website",
            "Never enter personal info on non-HTTPS sites",
            "Click the padlock to verify certificate details",
            "SSL prevents data interception by hackers"
        ],
        "whatYouWillLearn": [
            "Identify secure websites",
            "Understand how encryption works",
            "Verify website authenticity"
        ]
    },
    {
        "id": "social-engineering",
        "title": "Social Engineering Tactics",
        "description": "Psychological manipulation techniques used by hackers to gain confidential information.",
        "type": "Quiz",
        "duration": "3 min",
        "points": 15,
        "explanation": "Social engineering is when attackers manipulate people into giving up confidential information instead of hacking technical systems. They exploit human psychology - our trust, fear, and desire to help.\n\nCommon tactics:\n• Phishing: Fake emails pretending to be legitimate companies\n• Pretexting: Creating a fake scenario to get information\n• Baiting: Offering something tempting to trick victims\n• Tailgating: Following someone into a restricted area\n• Quid pro quo: Offering a benefit in exchange for information\n\nHow to protect yourself:\n• Never share sensitive information over phone or email\n• Verify the identity of anyone requesting information\n• Be suspicious of unsolicited requests\n• Trust your instincts - if something feels wrong, it probably is\n\nRemember: Legitimate organizations won't ask for passwords or sensitive data unexpectedly. When in doubt, hang up and call back using a verified number.",
        "keyPoints": [
            "Social engineering targets human psychology",
            "Always verify unexpected requests",
            "Never share passwords or sensitive data",
            "Be suspicious of urgency or pressure tactics",
            "When in doubt, stop and verify"
        ],
        "whatYouWillLearn": [
            "Recognize common manipulation tactics",
            "Verify identity before sharing information",
            "Respond safely to suspicious requests"
        ]
    },
    {
        "id": "two-factor-auth",
        "title": "Two-Factor Authentication",
        "description": "Discover how 2FA works and why it prevents most automated account hacks.",
        "type": "Lesson",
        "duration": "2 min",
        "points": 10,
        "explanation": "Two-Factor Authentication (2FA) adds an extra security layer to your accounts. Even if someone steals your password, they can't access your account without the second factor.\n\nHow 2FA works:\n• Something you know: Your password\n• Something you have: Your phone, security key, or authentication app\n• Something you are: Your fingerprint or face scan\n\nTypes of 2FA:\n• SMS codes: Text message with a temporary code\n• Authenticator apps: Google Authenticator, Microsoft Authenticator\n• Security keys: Physical USB devices like YubiKey\n• Biometrics: Fingerprint or face recognition\n\nAlways enable 2FA on important accounts like email, banking, and social media. Authentication apps are more secure than SMS because phone numbers can be hijacked.\n\nSome accounts offer backup codes - save these in a safe place. They let you access your account if you lose your phone.\n\n2FA isn't perfect, but it stops most automated attacks and significantly reduces your risk of being hacked.",
        "keyPoints": [
            "2FA requires two different authentication methods",
            "Always enable 2FA on important accounts",
            "Authenticator apps are more secure than SMS",
            "Save backup codes in a safe place",
            "2FA prevents most automated attacks"
        ],
        "whatYouWillLearn": [
            "Set up 2FA on your accounts",
            "Use authenticator apps effectively",
            "Manage backup codes safely"
        ]
    }
]

@router.get("/modules", response_model=List[schemas.LearningModuleResponse])
async def get_learning_modules(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Get all learning modules with current user's progress"""
    
    # Get user progress from DB
    user_progress = db.query(models.LearningProgress).filter(
        models.LearningProgress.user_id == current_user.id
    ).all()
    
    progress_map = {p.module_id: p for p in user_progress}
    
    response = []
    for module in LEARNING_MODULES:
        status = models.LearningModuleStatus.NOT_STARTED
        completed_at = None
        
        if module["id"] in progress_map:
            progress = progress_map[module["id"]]
            status = progress.status
            completed_at = progress.completed_at
            
        response.append(
            schemas.LearningModuleResponse(
                **module,
                status=status,
                completed_at=completed_at
            )
        )
        
    return response

@router.get("/modules/{module_id}", response_model=schemas.LearningModuleResponse)
async def get_single_module(
    module_id: str,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Get a single learning module by ID with current user's progress"""
    
    module = next((m for m in LEARNING_MODULES if m["id"] == module_id), None)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    # Check progress
    progress = db.query(models.LearningProgress).filter(
        models.LearningProgress.user_id == current_user.id,
        models.LearningProgress.module_id == module_id
    ).first()
    
    status = models.LearningModuleStatus.NOT_STARTED
    completed_at = None
    
    if progress:
        status = progress.status
        completed_at = progress.completed_at
        
    return schemas.LearningModuleResponse(
        **module,
        status=status,
        completed_at=completed_at
    )

@router.post("/modules/{module_id}/complete")
async def complete_module(
    module_id: str,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Mark a module as completed and award points"""
    
    # Validate module exists
    module = next((m for m in LEARNING_MODULES if m["id"] == module_id), None)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    # Check if already completed
    existing = db.query(models.LearningProgress).filter(
        models.LearningProgress.user_id == current_user.id,
        models.LearningProgress.module_id == module_id
    ).first()
    
    if existing and existing.status == models.LearningModuleStatus.COMPLETED:
        return {"message": "Module already completed", "points_awarded": 0}
        
    if existing:
        existing.status = models.LearningModuleStatus.COMPLETED
        existing.completed_at = datetime.utcnow()
    else:
        new_progress = models.LearningProgress(
            user_id=current_user.id,
            module_id=module_id,
            module_name=module["title"],
            status=models.LearningModuleStatus.COMPLETED,
            completed_at=datetime.utcnow()
        )
        db.add(new_progress)
        
    # Award points and update score
    current_user.points += module["points"]
    current_user.security_score = min(100, current_user.security_score + 2)
    current_user.learning_streak += 1
    
    # Check for badges
    completed_count = db.query(models.LearningProgress).filter(
        models.LearningProgress.user_id == current_user.id,
        models.LearningProgress.status == models.LearningModuleStatus.COMPLETED
    ).count()
    
    earned_badge = None
    if completed_count == 1:
        earned_badge = "🛡️ Privacy Guardian"
    elif completed_count == 3:
        earned_badge = "🏆 Security Expert"
        
    if earned_badge:
        # Check if already has it
        has_badge = db.query(models.UserBadge).filter(
            models.UserBadge.user_id == current_user.id,
            models.UserBadge.badge_name == earned_badge
        ).first()
        if not has_badge:
            db_badge = models.UserBadge(user_id=current_user.id, badge_name=earned_badge)
            db.add(db_badge)
            
    db.commit()
    
    return {
        "message": "Module completed!",
        "points_awarded": module["points"],
        "new_score": current_user.security_score,
        "badge_earned": earned_badge
    }

@router.get("/progress", response_model=schemas.LearningProgressResponse)
async def get_learning_progress(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Get aggregate learning progress for dashboard"""
    
    completed_modules = db.query(models.LearningProgress).filter(
        models.LearningProgress.user_id == current_user.id,
        models.LearningProgress.status == models.LearningModuleStatus.COMPLETED
    ).all()
    
    badges = db.query(models.UserBadge).filter(
        models.UserBadge.user_id == current_user.id
    ).all()
    
    return schemas.LearningProgressResponse(
        total_points=current_user.points,
        lessons_completed=len(completed_modules),
        completion_rate=int((len(completed_modules) / len(LEARNING_MODULES)) * 100),
        badges_earned=[b.badge_name for b in badges],
        streak=current_user.learning_streak
    )

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { FaLanguage, FaGlobe } from 'react-icons/fa';
import Button from "../components/ui/Button";

const MotionButton = motion.create(Button);

const LanguageSelect = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const handleLanguageSelect = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('preferredLanguage', lang);
        navigate('/login');
    };

    return (
        <div className="language-page-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="language-card glass"
            >
                <div className="icon-badge">
                    <FaLanguage size={40} color="var(--secondary)" />
                </div>
                <h1>Smart Hood</h1>
                <p className="subtitle">Choose your language / మీ ప్రాధాన్యత భాషను ఎంచుకోండి</p>

                <div className="language-options">
                    <MotionButton
                        unstyled
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="lang-btn telugu"
                        onClick={() => handleLanguageSelect('te')}
                    >
                        <span className="lang-name">తెలుగు</span>
                        <span className="lang-sub">Telugu</span>
                    </MotionButton>

                    <MotionButton
                        unstyled
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="lang-btn english"
                        onClick={() => handleLanguageSelect('en')}
                    >
                        <span className="lang-name">English</span>
                        <span className="lang-sub">International</span>
                    </MotionButton>
                </div>

                <div className="footer-info">
                    <FaGlobe className="spinning-globe" />
                    <span>Connecting Local Communities</span>
                </div>
            </motion.div>
        </div>
    );
};

export default LanguageSelect;

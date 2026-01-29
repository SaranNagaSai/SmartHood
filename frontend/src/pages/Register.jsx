import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import useSpeechInput from "../hooks/useSpeechToText";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { FaUser, FaPhoneAlt, FaMapMarkerAlt, FaBriefcase, FaMicrophone, FaArrowRight, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import "./Register.css";

const countryCodes = { India: "+91", USA: "+1", UK: "+44", Canada: "+1", Australia: "+61" };
const currencyRates = { INR: 1, USD: 83, EUR: 90, GBP: 105 };

function SpeechField({ value, setValue, placeholder, type = "text", icon: Icon }) {
  const speak = useSpeechInput(setValue);
  return (
    <div className="speech-field-group">
      <div className="field-icon"><Icon size={18} /></div>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        required
      />
      <button type="button" onClick={speak} className="mic-btn" title="Speak to type">
        <FaMicrophone />
      </button>
    </div>
  );
}

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    username: "", name: "", email: "", age: "", gender: "", nationality: "India", phone: "",
    bloodGroup: "", address: "", locality: "", area: "", district: "", town: "", city: "", state: "",
    professionCategory: "", profession: "", experience: "", income: "", currency: "INR",
    incomeINR: "", educationLevel: "", classYear: ""
  });

  const professionCategories = [
    "Student", "Software/IT", "Healthcare", "Business/Self-Employed",
    "Education/Teaching", "Manufacturing/Govt", "Creative/Arts",
    "Construction/Real Estate", "Service/Retail", "Other"
  ];

  const educationLevels = ["Schooling", "Intermediate/Diploma", "UG (Graduation)", "PG (Post-Graduation)", "Ph.D."];
  const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Class 1-10"];

  const set = (key) => (val) => setData({ ...data, [key]: val });
  const countryCode = countryCodes[data.nationality] || "";

  const handlePhone = (val) => { if (/^\d{0,10}$/.test(val)) set("phone")(val); };
  const handleIncome = (val) => {
    if (!/^\d*$/.test(val)) return;
    setData({ ...data, income: val, incomeINR: val * currencyRates[data.currency] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const isStudent = data.professionCategory === "Student";
      const payload = {
        ...data,
        experience: Number(data.experience) || 0,
        income: Number(data.income) || 0,
        age: Number(data.age),
        isStudent,
        studentDetails: isStudent ? {
          educationLevel: data.educationLevel,
          classYear: data.classYear
        } : undefined
      };
      console.log("Submitting Registration:", payload);
      const { data: userData } = await API.post("/auth/register", payload);

      if (userData.success) {
        login(userData.data);
        navigate("/home");
      }
    } catch (error) {
      console.error("Registration Error Details:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Registration failed. Please check your inputs and try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-layout">
      <Navbar />

      <div className="register-content">
        <div className="register-stepper">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="register-card"
          >
            <h1 className="gradient-text">{step === 1 ? t("register_step1_title") : t("register_step2_title")}</h1>
            <p className="subtitle">{t("register_step_desc", { step })}</p>

            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="form-step-container">
                  <SpeechField value={data.username} setValue={set("username")} placeholder="Username (Unique ID)" icon={FaUser} />
                  <SpeechField value={data.name} setValue={set("name")} placeholder={t("name") + " (Full Name)"} icon={FaUser} />

                  <div className="form-row">
                    <SpeechField value={data.email} setValue={set("email")} placeholder="Email Address (Optional)" type="email" icon={FaUser} />
                    <SpeechField value={data.age} setValue={set("age")} placeholder={t("age")} type="number" icon={FaUser} />
                  </div>

                  <div className="form-row">
                    <div className="select-group">
                      <select onChange={(e) => set("gender")(e.target.value)} value={data.gender} required>
                        <option value="">{t("gender")}</option>
                        <option value="Male">{t("gender_male")}</option>
                        <option value="Female">{t("gender_female")}</option>
                        <option value="Other">{t("gender_other")}</option>
                      </select>
                    </div>
                    <div className="select-group">
                      <select onChange={(e) => set("nationality")(e.target.value)} value={data.nationality} required>
                        <option>India</option><option>USA</option><option>UK</option><option>Canada</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="select-group">
                      <select onChange={(e) => set("bloodGroup")(e.target.value)} value={data.bloodGroup} required>
                        <option value="">Blood Group</option>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className="phone-field-group">
                    <span className="country-code">{countryCode}</span>
                    <input value={data.phone} onChange={(e) => handlePhone(e.target.value)} placeholder={t("phone")} required />
                    <FaPhoneAlt className="faint-icon" />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="btn-premium wide"
                    onClick={() => setStep(2)}
                  >
                    {t("next")} <FaArrowRight />
                  </motion.button>
                </div>
              ) : (
                <div className="form-step-container">
                  <div className="divider"><span>Location Details</span></div>

                  <SpeechField value={data.address} setValue={set("address")} placeholder={t("address")} icon={FaMapMarkerAlt} />

                  <div className="form-row">
                    <SpeechField value={data.locality} setValue={set("locality")} placeholder={t("locality")} icon={FaMapMarkerAlt} />
                    <SpeechField value={data.area} setValue={set("area")} placeholder={t("area")} icon={FaMapMarkerAlt} />
                  </div>

                  <div className="form-row">
                    <SpeechField value={data.district} setValue={set("district")} placeholder="District" icon={FaMapMarkerAlt} />
                    <SpeechField value={data.town} setValue={set("town")} placeholder="Town" icon={FaMapMarkerAlt} />
                  </div>

                  <div className="form-row">
                    <SpeechField value={data.city} setValue={set("city")} placeholder={t("city")} icon={FaMapMarkerAlt} />
                    <SpeechField value={data.state} setValue={set("state")} placeholder={t("state")} icon={FaMapMarkerAlt} />
                  </div>

                  <div className="divider"><span>Employment</span></div>

                  <div className="form-row">
                    <div className="select-group">
                      <select value={data.professionCategory} onChange={(e) => set("professionCategory")(e.target.value)} required>
                        <option value="">{t("profession_cat_placeholder")}</option>
                        {professionCategories.map(cat => <option key={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <SpeechField
                      value={data.profession}
                      setValue={set("profession")}
                      placeholder={data.professionCategory === "Student" ? "Specific Major/Degree" : "Specific Work/Title"}
                      icon={FaBriefcase}
                    />
                  </div>

                  {data.professionCategory === "Student" && (
                    <motion.div
                      className="form-row animated-fields"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="select-group">
                        <select value={data.educationLevel} onChange={(e) => set("educationLevel")(e.target.value)} required>
                          <option value="">{t("education")}</option>
                          {educationLevels.map(lvl => <option key={lvl}>{lvl}</option>)}
                        </select>
                      </div>
                      <div className="select-group">
                        <select value={data.classYear} onChange={(e) => set("classYear")(e.target.value)} required>
                          <option value="">{t("education")}</option>
                          {academicYears.map(yr => <option key={yr}>{yr}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {data.professionCategory !== "Student" && (
                    <div className="form-row">
                      <SpeechField
                        value={data.experience}
                        setValue={set("experience")}
                        placeholder="Years of Experience"
                        type="number"
                        icon={FaBriefcase}
                      />
                      <div className="income-group">
                        <div className="select-group sm">
                          <select value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })}>
                            <option>INR</option><option>USD</option><option>EUR</option>
                          </select>
                        </div>
                        <input value={data.income} onChange={(e) => handleIncome(e.target.value)} placeholder={t("monthly_income")} className="glass-input" required />
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" className="btn-back" onClick={() => setStep(1)}>
                      <FaArrowLeft /> {t("back")}
                    </button>
                    <button type="submit" className="btn-premium" disabled={loading}>
                      {loading ? t("joining") : t("complete_registration")} <FaCheckCircle />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Register;

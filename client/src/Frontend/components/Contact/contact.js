import { useState } from "react";
import emailjs from "emailjs-com";
import { useForm } from "react-hook-form";
import "../styles/contact.css";

const Contact = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const [messageStatus, setMessageStatus] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await emailjs.send(
        "service_h21foc9", // Your Email.js Service ID
        "template_t64w4wp", // Your Email.js Template ID
        data,
        "PV9slaOWlMSALkZ3v" // Your Email.js Public Key
      );

      if (response.status === 200) {
        setMessageStatus("Message sent successfully! ✅");
        reset();
      } else {
        setMessageStatus("Failed to send message. Please try again later. ❌");
      }
    } catch (error) {
      console.error("Email Error:", error);
      setMessageStatus("Error sending message. Please check your details.");
    }
  };

  const selectedCountry = watch("country");

  const phoneValidationPatterns = {
    US: /^[2-9]\d{2}[2-9](?!11)\d{6}$/, // US
    EG: /^(00201|201|01)[0-9]{9}$/, // Egypt
    UK: /^(07\d{9}|(\+44\d{10}))$/, // UK
    FR: /^(\+33|0)[1-9](\d{8})$/, // France
    DE: /^(\+49|0)[1-9](\d{7,9})$/, // Germany
    IN: /^[6789]\d{9}$/, // India
  };

  return (
    <section id="contact" className="contact-container">
      <div className="frame-container">
        <h2>Contact Me</h2>
        <p className="sub--title">Let's connect and discuss your project!</p>

        <form
          className="contact-form-container"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="container">
            {/* Name */}
            <label className="contact-label">
              <span>Name</span>
              <input
                type="text"
                className="contact-input"
                {...register("name", {
                  required: "Name is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Only letters are allowed",
                  },
                })}
              />
              {errors.name && (
                <p className="error-message">{errors.name.message}</p>
              )}
            </label>

            {/* Email */}
            <label className="contact-label">
              <span>Email</span>
              <input
                type="email"
                className="contact-input"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Invalid email format",
                  },
                })}
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </label>

            {/* Country */}
            <label className="contact-label">
              <span>Country</span>
              <select
                className="contact-input"
                {...register("country", {
                  required: "Please select a country",
                })}
              >
                <option value="">Select Your Country...</option>
                <option value="US">🇺🇸 United States</option>
                <option value="EG">🇪🇬 Egypt</option>
                <option value="UK">🇬🇧 United Kingdom</option>
                <option value="FR">🇫🇷 France</option>
                <option value="DE">🇩🇪 Germany</option>
                <option value="IN">🇮🇳 India</option>
              </select>
              {errors.country && (
                <p className="error-message">{errors.country.message}</p>
              )}
            </label>

            {/* Phone */}
            <label className="contact-label">
              <span>Phone Number</span>
              <input
                type="tel"
                className="contact-input"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: selectedCountry
                      ? phoneValidationPatterns[selectedCountry]
                      : /^[0-9]{10,15}$/,
                    message: "Invalid phone number format for selected country",
                  },
                })}
              />
              {errors.phone && (
                <p className="error-message">{errors.phone.message}</p>
              )}
            </label>
          </div>

          {/* Topic */}
          <label className="contact-label">
            <span>Topic</span>
            <select
              className="contact-input"
              {...register("topic", { required: "Please select a topic" })}
            >
              <option value="">Select One...</option>
              <option value="Bedroom">Bedroom</option>
              <option value="Day-Complement">Day-Complement</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Cybersecurity">Night Complement</option>
              <option value="Networking & DevOps">OutDoor</option>
            </select>
            {errors.topic && (
              <p className="error-message">{errors.topic.message}</p>
            )}
          </label>

          {/* Message */}
          <label className="contact-label">
            <span>Message</span>
            <textarea
              className="contact-input"
              {...register("message", {
                required: "Message cannot be empty",
                minLength: {
                  value: 10,
                  message: "Message must be at least 10 characters",
                },
                maxLength: {
                  value: 500,
                  message: "Message cannot exceed 500 characters",
                },
              })}
              rows="6"
            ></textarea>
            {errors.message && (
              <p className="error-message">{errors.message.message}</p>
            )}
          </label>

          {/* Terms */}
          <label className="checkbox-label">
            <input
              type="checkbox"
              {...register("terms", { required: "You must accept the terms" })}
            />
            <span>I accept the terms</span>
          </label>
          {errors.terms && (
            <p className="error-message">{errors.terms.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary contact-form-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>

          {/* Status */}
          {messageStatus && <p className="message-status">{messageStatus}</p>}
        </form>
      </div>
    </section>
  );
};

export default Contact;

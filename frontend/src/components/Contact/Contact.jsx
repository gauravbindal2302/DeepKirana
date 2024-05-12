import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Contact.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function Contact({ title }) {
  const SERVER_URL = "https://deep-kirana-server.vercel.app";

  useEffect(() => {
    document.title = title;
  }, [title]);

  const [form, setForm] = useState({
    fName: "",
    lName: "",
    email: "",
    phone: "",
    message: "",
    timestamp: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const { fName, lName, email, phone, message } = form;
    if (fName === "" || lName === "" || phone === "" || message === "") {
      alert("Please fill all the fields.");
    } else {
      axios.post(`${SERVER_URL}/contact`, form).then((res) => {
        alert(res.data.message);
        setForm({
          fName: "",
          lName: "",
          email: "",
          phone: "",
          message: "",
        });
      });
    }
  }

  return (
    <>
      <Navbar />
      <div className="contact-row">
        <div className="contact-column-1">
          <div className="contact-c1-r1">
            <Link to="/">
              <i className="fas fa-solid fa-arrow-left" />
              <span>Back to Home</span>
            </Link>
            <h1>Contact Us</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatibus magni voluptates nulla perferendis soluta delectus
              officia architecto cupiditate minima corrupti dignissimos
              consequuntur amet placeat pariatur temporibus, exercitationem ipsa
              nisi nesciunt ducimus nam inventore ipsam!
            </p>
          </div>

          <div className="contact-c1-r2">
            <div className="call-email-address">
              <div className="call-email">
                <span className="call">
                  <h2>Call Us</h2>
                  <p>1245987876</p>
                </span>
                <span className="email">
                  <h2>Email</h2>
                  <p>abc@gmail.com</p>
                </span>
              </div>
              <div className="address">
                <span>
                  <h2>Address</h2>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. A
                    cupiditate id accusamus distinctio vel unde hic? Quo eos
                    modi
                  </p>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="contact-column-2">
          <form className="contact-form" onSubmit={handleSubmit}>
            <span>
              First Name
              <span style={{ color: "red" }}> *</span>
              <br />
              <input
                type="name"
                name="fName"
                placeholder="First Name"
                value={form.fName}
                onChange={handleChange}
              />
            </span>

            <span>
              Last Name
              <span style={{ color: "red" }}> *</span>
              <br />
              <input
                type="name"
                name="lName"
                placeholder="Last Name"
                value={form.lName}
                onChange={handleChange}
              />
            </span>
            <span>
              Email:
              <br />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
            </span>
            <span>
              Phone Number
              <span style={{ color: "red" }}> *</span>
              <br />
              <input
                type="name"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="no-arrow"
              />
            </span>
            <span>
              Message
              <span style={{ color: "red" }}> *</span>
              <br />
              <textarea
                placeholder="How can we help you?"
                name="message"
                id=""
                cols="30"
                rows="10"
                value={form.message}
                onChange={handleChange}
              />
            </span>
            <button className="contact-submit" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

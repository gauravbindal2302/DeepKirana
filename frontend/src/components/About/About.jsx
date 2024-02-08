import React, { useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import "./About.css";
import Footer from "../Footer/Footer";

export default function About({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <>
      <Navbar />
      <div className="about-page">
        <div className="about-r1">
          <h1>About Us</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Voluptatibus magni voluptates nulla perferendis soluta delectus
            officia architecto cupiditate minima corrupti dignissimos
            consequuntur amet placeat pariatur temporibus, exercitationem ipsa
            nisi nesciunt ducimus nam inventore ipsam!
          </p>
        </div>
        <div className="about-r2">
          <div className="about-r2-c1">
            <h1>About Our Shop</h1>
          </div>
          <div className="about-r2-c2">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum, placeat veniam dolore laborum aperiam explicabo
              repellendus atque beatae. Molestiae, facilis natus. Dolorem
              deserunt voluptatum ipsam veniam consequatur amet iste illum nam
              laborum distinctio soluta repudiandae dolorum ab aliquid incidunt
              cupiditate maiores natus atque perspiciatis mollitia nisi,
              doloremque, harum corporis magnam! Enim nemo voluptas ea impedit
              pariatur, repudiandae expedita beatae ratione velit et veniam
              distinctio reprehenderit. Consequuntur quia odio tempora vitae.
            </p>
          </div>
        </div>
        <div className="about-r3">
          <div className="about-r3-c1">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum, placeat veniam dolore laborum aperiam explicabo
              repellendus atque beatae. Molestiae, facilis natus. Dolorem
              deserunt voluptatum ipsam veniam consequatur amet iste illum nam
              laborum distinctio soluta repudiandae dolorum ab aliquid incidunt
              cupiditate maiores natus atque perspiciatis mollitia nisi,
              doloremque, harum corporis magnam! Enim nemo voluptas ea impedit
              pariatur, repudiandae expedita beatae ratione velit et veniam
              distinctio reprehenderit. Consequuntur quia odio tempora vitae.
            </p>
          </div>
          <div className="about-r3-c2">
            <h1>About Our Products</h1>
          </div>
        </div>
        <div className="about-r4">
          <div className="about-r4-columns">
            <h1>Fast Delivery</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
              esse suscipit quidem facere at.
            </p>
          </div>
          <div className="about-r4-columns">
            <h1>Many Offers</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
              esse suscipit quidem facere at.
            </p>
          </div>
          <div className="about-r4-columns">
            <h1>24/7 Support</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
              esse suscipit quidem facere at.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

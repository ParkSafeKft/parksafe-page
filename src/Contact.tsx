import { Mail, User, Phone, Clock, MapPin } from "lucide-react";
import "./Contact.css";

function Contact() {

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>
            <Mail className="header-icon" size={40} />
            Kapcsolat
          </h1>
          <p>
            Van kérdésed a ParkSafe-ről vagy szeretnél visszajelzést küldeni?
            Örömmel állunk rendelkezésedre!
          </p>
        </div>

        <div className="contact-content-centered">
          <div className="contact-card">
            <div className="contact-person">
              <div className="person-avatar">
                <User size={48} />
              </div>
              <h2>Perjési Szabolcs</h2>
              <p className="person-role">Üzletvezető & Kapcsolattartó</p>
            </div>

            <div className="contact-details">
              <a href="mailto:perjesidev@gmail.com" className="contact-item">
                <div className="contact-icon">
                  <Mail size={24} />
                </div>
                <div className="contact-text">
                  <h3>Email</h3>
                  <p>perjesidev@gmail.com</p>
                </div>
              </a>

              <a href="tel:+36307212524" className="contact-item">
                <div className="contact-icon">
                  <Phone size={24} />
                </div>
                <div className="contact-text">
                  <h3>Telefon</h3>
                  <p>+36 30 721 2524</p>
                </div>
              </a>

              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={24} />
                </div>
                <div className="contact-text">
                  <h3>Helyszín</h3>
                  <p>Szeged, Magyarország</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Clock size={24} />
                </div>
                <div className="contact-text">
                  <h3>Válaszidő</h3>
                  <p>24-48 órán belül</p>
                </div>
              </div>
            </div>

            <div className="contact-note">
              <p>
                Kérdésed van az applikációval, adatokkal kapcsolatban, vagy szeretnél
                együttműködni velünk? Írj bátran emailben vagy hívj telefonon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;

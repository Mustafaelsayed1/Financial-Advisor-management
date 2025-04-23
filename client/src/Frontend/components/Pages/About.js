import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../styles/Pages.css";

const About = () => {
  return (
    <div className="about-page">
      <section className="section hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={12} className="text-center">
              <h1 className="section-title">About Us</h1>
              <p className="lead">
                Empowering financial decisions through AI technology
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="mb-4">Our Mission</h2>
              <p>
                At Financial AI Advisor, our mission is to democratize financial
                advice and make it accessible to everyone. We believe that
                financial literacy and smart money management should not be
                privileges reserved for the wealthy, but essential tools
                available to all.
              </p>
              <p>
                Through our AI-powered platform, we provide personalized
                financial guidance, helping users make informed decisions about
                their money, investments, savings, and overall financial
                well-being.
              </p>
            </Col>
            <Col lg={6} className="text-center">
              <div className="about-image mission-img"></div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="order-lg-2">
              <h2 className="mb-4">Our Story</h2>
              <p>
                Financial AI Advisor was founded in 2023 by a team of finance
                professionals and AI specialists who recognized a significant
                gap in the market: high-quality financial advice was often
                inaccessible to ordinary people due to high costs and minimum
                investment requirements.
              </p>
              <p>
                We set out to build an intelligent platform that could analyze
                individual financial situations and provide tailored guidance
                comparable to what you'd receive from a human financial advisor,
                but at a fraction of the cost and available 24/7.
              </p>
            </Col>
            <Col lg={6} className="text-center order-lg-1">
              <div className="about-image story-img"></div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section">
        <Container>
          <h2 className="section-title">Our Values</h2>
          <Row className="mt-5">
            <Col md={4} className="mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="value-icon accessibility-icon mb-3"></div>
                  <h3>Accessibility</h3>
                  <p>
                    Making financial advice available to everyone regardless of
                    their income or assets.
                  </p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="value-icon transparency-icon mb-3"></div>
                  <h3>Transparency</h3>
                  <p>
                    Being clear about how we work, what we can offer, and the
                    limitations of our service.
                  </p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="value-icon innovation-icon mb-3"></div>
                  <h3>Innovation</h3>
                  <p>
                    Continuously improving our AI to provide more accurate and
                    personalized financial guidance.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default About;

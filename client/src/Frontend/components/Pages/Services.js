import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../styles/Pages.css";

const Services = () => {
  const services = [
    {
      id: 1,
      title: "Personal Finance Management",
      description:
        "Track your income, expenses, and savings goals with our intuitive dashboard. Our AI analyzes your spending patterns and suggests ways to optimize your budget.",
      icon: "finance-icon",
    },
    {
      id: 2,
      title: "Investment Advisory",
      description:
        "Receive personalized investment recommendations based on your financial goals, risk tolerance, and time horizon. Our AI keeps track of market trends and adjusts suggestions accordingly.",
      icon: "investment-icon",
    },
    {
      id: 3,
      title: "Debt Management",
      description:
        "Develop a strategic plan to pay off debts efficiently. Our AI creates personalized debt reduction strategies to help you become debt-free faster.",
      icon: "debt-icon",
    },
    {
      id: 4,
      title: "Retirement Planning",
      description:
        "Plan for a secure retirement with personalized projections and savings strategies. Our AI helps you determine how much you need to save and the best ways to reach your retirement goals.",
      icon: "retirement-icon",
    },
    {
      id: 5,
      title: "Financial Education",
      description:
        "Access a wealth of educational resources tailored to your financial situation and goals. Our AI recommends relevant articles, videos, and tutorials based on your needs.",
      icon: "education-icon",
    },
    {
      id: 6,
      title: "Tax Optimization",
      description:
        "Maximize your tax efficiency with personalized suggestions for tax-saving strategies. Our AI keeps up with tax law changes and helps you plan accordingly.",
      icon: "tax-icon",
    },
  ];

  return (
    <div className="services-page">
      <section className="section hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={12} className="text-center">
              <h1 className="section-title">Our Services</h1>
              <p className="lead">
                Comprehensive financial solutions powered by artificial
                intelligence
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Row>
            {services.map((service) => (
              <Col lg={4} md={6} className="mb-4" key={service.id}>
                <div className="service-card card h-100">
                  <div className="card-body">
                    <div className={`service-icon ${service.icon} mb-3`}></div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="mb-4">How Our AI Works</h2>
              <p>
                Our advanced artificial intelligence platform analyzes your
                financial data, market trends, and economic indicators to
                provide personalized recommendations tailored to your unique
                situation.
              </p>
              <ul className="feature-list">
                <li>Data analysis from multiple financial sources</li>
                <li>Pattern recognition to identify spending habits</li>
                <li>Predictive modeling for investment opportunities</li>
                <li>Risk assessment based on your financial profile</li>
                <li>Continuous learning to improve recommendations</li>
              </ul>
            </Col>
            <Col lg={6} className="text-center">
              <div className="services-image ai-works-img"></div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section cta-section text-center">
        <Container>
          <h2 className="mb-4">Ready to Transform Your Financial Future?</h2>
          <p className="lead mb-4">
            Join thousands of users who have improved their financial well-being
            with our AI advisor.
          </p>
          <button className="btn btn-primary btn-lg">
            Start Your Free Trial
          </button>
        </Container>
      </section>
    </div>
  );
};

export default Services;

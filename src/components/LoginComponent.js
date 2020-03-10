/** @format */

import React from "react";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardHeader,
  Media,
  FormFeedback,
  CardBody
} from "reactstrap";
import "../index.css";
import { withRouter } from "react-router-dom";

function Login({ onSubmit, onChange, onBlur, fields, errors, signupPage }) {
  return (
    <div className="row">
      <div className="col-lg-6 col-sm-12 mb-3">
        <Media src="/survey.svg" alt="logo" height="100px" className="mb-5 mt-4" />
        <h2>
          Build your own survey
          <br />
          easily ...
        </h2>
      </div>
      <div className="col-lg-6 col-sm-12">
        <Card>
          <CardHeader>
            <h2>Login</h2>
          </CardHeader>
          <CardBody>
            <Form onSubmit={onSubmit}>
              <FormGroup>
                <Label htmlFor="username">
                  <strong>Username</strong>
                </Label>
                <Input
                  type="text"
                  name="username"
                  id="username"
                  className="form-control"
                  placeholder="username"
                  value={fields.username}
                  onChange={onChange}
                  onBlur={() => onBlur("username")}
                  invalid={errors.username !== ""}
                />
                <FormFeedback>{errors.username}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="password">
                  <strong>Password</strong>
                </Label>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  placeholder="password"
                  onChange={onChange}
                  onBlur={() => onBlur("password")}
                  invalid={errors.password !== ""}
                />
                <FormFeedback>{errors.password}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Button type="submit" outline className="btn-block mt-5" color="dark">
                  Login
                </Button>
              </FormGroup>
            </Form>
          </CardBody>
        </Card>
        <div>
          <FormGroup>
            <br />
            <h3>Or create a new account</h3>
            <Button
              type="button"
              value="login"
              outline
              color="dark"
              className="mt-3 btn-block"
              onClick={signupPage}
            >
              Signup
            </Button>
          </FormGroup>
        </div>
      </div>
    </div>
  );
}

export default withRouter(Login);

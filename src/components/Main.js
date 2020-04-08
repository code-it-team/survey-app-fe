/** @format */

import Axios from "axios";
import React, { Component } from "react";
// @ts-ignore
import { Fade } from "react-animation-components";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";
import { Spinner } from "reactstrap";
import { baseUrl } from "../shared/baseUrl";
import { MAXLEN, MINLEN } from "../shared/globals";
import { getJWT, getUserId, isAuth } from "../shared/helperFunctions";
import * as ROUTES from "../shared/routes";
import AuthRoute from "./AuthRoute";
import Footer from "./Footer";
import GeneralError from "./GeneralError";
import Login from "./Login";
import Signup from "./Signup";
import { default as Survey } from "./Survey";

// Global Variables
const INITIAL_STATE = {
  jwt: "",
  fields: {
    id: 0,
    username: "",
    password: "",
    password_confirm: "",
    survey_name: "",
    question: "",
    option: "",
  },
  errors: {
    username: null,
    password: null,
    password_confirm: null,
    login: null,
    signup: null,
    survey_name: null,
    question: null,
  },
  spinner: <></>,
  surveys: [], // list of all surveys
};

class Main extends Component {
  /**
   * @param {any} props
   */
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
    // Binding
    this.onChange = this.onChange.bind(this);
    this.onLoginSubmit = this.onLoginSubmit.bind(this);
    this.onSignupSubmit = this.onSignupSubmit.bind(this);
    this.onAddSurveySubmit = this.onAddSurveySubmit.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.signupRedirect = this.signupRedirect.bind(this);
    this.loginRedirect = this.loginRedirect.bind(this);
  }

  // ############################################################
  // ############################################################
  // ##############       Life-cycle Methods       ##############
  // ############################################################
  // ############################################################
  componentDidMount() {
    // if the user has a valid token, get all his/her surveys
    if (getJWT()) {
      this.getSurveys(getUserId());
    }
  }

  // ############################################################
  // ############################################################
  // ################       event handlers       ################
  // ############################################################
  // ############################################################
  // <<<<<<<<<<<<<<<<<<<<       General       >>>>>>>>>>>>>>>>>>>
  /** Set state to input values
   * @param {{ target: object; }} event
   */
  onChange = (event) => {
    // reset error message
    this.setState({
      errors: { ...this.state.errors, login: null, signup: null },
    });

    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({ fields: { ...this.state.fields, [name]: value } });
  };

  activateSpinner = () => {
    // if any error exists do not load the spinner
    this.setState({
      spinner: (
        <Spinner color="primary" style={{ width: "20px", height: "20px" }} />
      ),
    });
  };

  // Redirect to Signup page
  signupRedirect = () => {
    this.props.history.push(ROUTES.SIGNUP);
  };

  // Redirect to Login page
  loginRedirect = () => {
    this.props.history.push(ROUTES.LOGIN);
  };

  /** Validate input rules on blur
   * @param {object} field
   */
  onBlur = (field) => {
    // destructor
    const {
      username,
      password,
      password_confirm,
      survey_name,
    } = this.state.fields;
    // on Blur apply validations

    // ===================      Username       ===================
    if (field === "username") {
      if (username.length < MINLEN)
        this.setState({
          errors: {
            ...this.state.errors,
            username: <p>Username should be &ge; {MINLEN} characters!</p>,
          },
        });
      else {
        this.setState({ errors: { ...this.state.errors, username: null } });
      }
    }

    // ===================      Password       ==================
    else if (field === "password") {
      if (password.length < MINLEN)
        this.setState({
          errors: {
            ...this.state.errors,
            password: <p>Password should be &ge; {MINLEN} characters!</p>,
          },
        });

      // if no errors
      if (password.length >= MINLEN) {
        this.setState({
          errors: { ...this.state.errors, password: null },
        });
      }
    }

    // ================      Confirm Password       ===============
    // only for signup form
    else if (field === "password_confirm") {
      if (password_confirm !== password) {
        this.setState({
          errors: {
            ...this.state.errors,
            password_confirm: <p>Please make sure your passwords match!</p>,
          },
        });
      } else {
        this.setState({
          errors: { ...this.state.errors, password_confirm: null },
        });
      }
    }

    // ===================      Survey Name       =================
    else if (field === "survey_name") {
      if (survey_name.length < MINLEN) {
        this.setState({
          errors: {
            ...this.state.errors,
            survey_name: (
              <p>Survey name should be &ge; {MINLEN} characters!</p>
            ),
          },
        });
      } else if (survey_name.length >= MAXLEN) {
        this.setState({
          errors: {
            ...this.state.errors,
            survey_name: (
              <p>Survey name should be &le; {MAXLEN} characters!</p>
            ),
          },
        });
      }
      // if no errors
      else {
        this.setState({ errors: { ...this.state.errors, survey_name: null } });
      }
    }
  };

  // <<<<<<<<<<<<<<<<<<<<<       Login       >>>>>>>>>>>>>>>>>>>>
  /** When submit the form, Login with the passed credentials to obtain the `JWT`
   * @param {{ preventDefault: () => void; }} event
   */
  onLoginSubmit = (event) => {
    event.preventDefault();
    // check for errors
    const errors = this.state.errors;
    const { username, password } = this.state.fields;
    if (
      errors.username === null &&
      username !== "" &&
      errors.password === null &&
      password !== ""
    ) {
      // remove error messages if exist
      this.setState({ errors: { ...this.state.errors, login: null } });

      // activate spinner button
      this.activateSpinner();

      this.login(
        baseUrl + "authenticate",
        this.state.fields.username,
        this.state.fields.password,
        this.getSurveys
      );
    }
    // else, if the login form was not filled in print it an error message
    else {
      this.setState({
        errors: {
          ...this.state.errors,
          login: <p>Please fill in the form fields!</p>,
        },
        spinner: <></>,
      });
    }
  };

  // <<<<<<<<<<<<<<<<<<<<       Signup       >>>>>>>>>>>>>>>>>>>>
  /**
   * @param {{ preventDefault: () => void; }} event
   */
  onSignupSubmit = (event) => {
    event.preventDefault();
    // check for errors
    const errors = this.state.errors;
    const { username, password, password_confirm } = this.state.fields;
    if (
      errors.username === null &&
      username !== "" &&
      errors.password === null &&
      password !== "" &&
      errors.password_confirm === null &&
      password_confirm !== ""
    ) {
      // remove error messages if exist
      this.setState({ errors: { ...this.state.errors, signup: null } });

      // activate spinner button
      this.activateSpinner();

      this.signup(
        baseUrl + "signUp",
        this.state.fields.username,
        this.state.fields.password
      );
    } else {
      // handle clicking on submit button without filling all fields, and deactivate spinner
      this.setState({
        errors: {
          ...this.state.errors,
          signup: <p>Please Fill in the form fields!</p>,
        },
        spinner: <></>,
      });
    }
  };

  // <<<<<<<<<<<<<<<<<<<<       Survey       >>>>>>>>>>>>>>>>>>>>
  /**
   * @param {{ preventDefault: () => void; }} event
   */
  onAddSurveySubmit = (event) => {
    event.preventDefault();
    // check for errors
    const errors = this.state.errors;
    const { survey_name } = this.state.fields;
    // if no errors, submit
    if (errors.survey_name === null && survey_name !== "") {
      // remove error messages if exist
      this.setState({ errors: { ...this.state.errors, survey_name: null } });

      this.addSurvey(
        baseUrl + "addSurvey",
        this.state.fields.survey_name,
        getUserId()
      );
    }
    // * There is no need to handle errors as the submit button is disabled
    // * when there is something wrong
  };

  // ############################################################
  // ############################################################
  // ####################       Actions       ###################
  // ############################################################
  // ############################################################
  // Reset the state to the initial values
  resetState = () => {
    this.setState(INITIAL_STATE);
  };

  // <<<<<<<<<<<<<<<<<<<<<       Login       >>>>>>>>>>>>>>>>>>>>

  /** The Login function
   * @param {string} _username
   * @param {string} _password
   * @param {string} _url
   * @param {Function} getSurveys
   */
  login = (_url, _username, _password, getSurveys) => {
    Axios.post(_url, {
      username: _username,
      password: _password,
    })
      .then((res) => {
        // if correct response
        if (res.status === 200) {
          // console.log(res);
          this.setState({
            jwt: res.data.jwt,
            fields: { ...this.state.fields, id: res.data.surveyUserDTO.id },
          });
          localStorage.setItem("jwt", res.data.jwt);
          localStorage.setItem("username", this.state.fields.username);
          localStorage.setItem("id", this.state.fields.id.toString());
          this.props.history.push(ROUTES.HOME);

          // get the surveys' of this user
          getSurveys(localStorage.getItem("id"));
        }
      })
      .catch((error) => {
        console.log(error.response);

        // deactivate spinner
        this.setState({ spinner: <></> });

        // handle general error
        if (!error.response) {
          return this.props.history.push(ROUTES.GENERAL_ERROR);
        }

        // handling
        if (error && error.response.status === 404) {
          this.setState({
            errors: {
              ...this.state.errors,
              login: <p>Username or Password is not valid!</p>,
            },
          });
        }
      });
  };

  // <<<<<<<<<<<<<<<<<<<<       Logout       >>>>>>>>>>>>>>>>>>>>
  /* Reset to the initial state, remove the token from the local 
   storage, and redirect to login page
  */
  logout = () => {
    this.resetState();
    localStorage.clear();
    this.props.history.push(ROUTES.LOGIN);
  };

  // <<<<<<<<<<<<<<<<<<<<<       Signup       >>>>>>>>>>>>>>>>>>>
  /**
   * @param {string} _url
   * @param {string} _username
   * @param {string} _password
   */
  signup = (_url, _username, _password) => {
    Axios.post(_url, {
      username: _username,
      password: _password,
      authority: {
        role: "ROLE_USER",
      },
    })
      .then((res) => {
        // console.log(res);
        // if user added successfully, redirect to login page and
        // fill in the credentials
        if (res.status === 200) {
          this.props.history.push(ROUTES.LOGIN);

          // deactivate spinner
          this.setState({ spinner: <></> });
        }
      })
      .catch((error) => {
        console.log(error.response);

        // deactivate spinner
        this.setState({ spinner: <></> });

        // handle general error
        if (!error.response) {
          return this.props.history.push(ROUTES.GENERAL_ERROR);
        }

        // resolve 409 error which means duplicate username
        if (error.response.status === 409) {
          this.setState({
            errors: {
              ...this.state.errors,
              signup: <p>Username already exists!</p>,
            },
          });
        }
      });
  };

  // <<<<<<<<<<<<<<<<<<<<       Survey       >>>>>>>>>>>>>>>>>>>>
  // callback function to get the surveys of a user by id, save them to local storage
  /**
   * @param {any} _id
   */
  getSurveys = (_id) => {
    Axios.get(baseUrl + "getSurveysByUser", {
      headers: {
        Authorization: getJWT(),
      },
      params: {
        id: _id,
      },
    })
      .then((res) => {
        // correct response
        if (res.status === 200) {
          // console.log(res);

          this.setState({ surveys: res.data.surveyDTOS });

          // save to locale storage
          localStorage.setItem("surveys", JSON.stringify(this.state.surveys));
        }
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  // ############################################################
  // ############################################################
  // ################       Pages Rendering       ###############
  // ############################################################
  // ############################################################
  loginPage = () => {
    return (
      <Login
        onSubmit={(event) => this.onLoginSubmit(event)}
        onChange={(event) => this.onChange(event)}
        onBlur={(field) => this.onBlur(field)}
        fields={this.state.fields}
        errors={this.state.errors}
        signupOnClick={this.signupRedirect}
        spinner={this.state.spinner}
      />
    );
  };

  signupPage = () => {
    return (
      <Signup
        onSubmit={(event) => this.onSignupSubmit(event)}
        onChange={(event) => this.onChange(event)}
        onBlur={(field) => this.onBlur(field)}
        fields={this.state.fields}
        errors={this.state.errors}
        loginOnClick={this.loginRedirect}
        spinner={this.state.spinner}
      />
    );
  };

  surveyPage = () => {
    return <Survey getSurveys={this.getSurveys} surveys={this.state.surveys} />;
  };

  // ############################################################
  // ############################################################
  // ####################       Render       ####################
  // ############################################################
  // ############################################################
  render() {
    return (
      <Fade in delay={100} duration={700}>
        <React.Fragment>
          <Switch>
            <AuthRoute
              exact
              isAuthenticated={isAuth()}
              path={ROUTES.HOME}
              component={this.surveyPage}
              logout={this.logout}
            />
            <Route path={ROUTES.LOGIN} component={this.loginPage} />
            <Route path={ROUTES.SIGNUP} component={this.signupPage} />
            <Route path={ROUTES.GENERAL_ERROR} component={GeneralError} />
            <Redirect to={ROUTES.LOGIN} />
          </Switch>
          <Footer />
        </React.Fragment>
      </Fade>
    );
  }
}

export default withRouter(Main);
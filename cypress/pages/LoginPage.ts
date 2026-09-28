class LoginPage {
  private get usernameInput() {
    return cy.get('[data-test="username"]');
  }

  private get passwordInput() {
    return cy.get('[data-test="password"]');
  }

  get loginButton() {
    return cy.get('[data-test="login-button"]');
  }

  get errorMessage() {
    return cy.get('[data-test="error"]');
  }

  visit() {
    cy.visit('/');
  }

  login(username: string, password: string) {
    this.usernameInput.clear().type(username);
    this.passwordInput.clear().type(password);
    this.loginButton.click();
  }

  submit() {
    this.loginButton.click();
  }
}

export default new LoginPage();
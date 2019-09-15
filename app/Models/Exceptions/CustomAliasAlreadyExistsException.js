'use strict'

class CustomAliasAlreadyExistsException {

  constructor(custom_alias) {
    this.alias = custom_alias;
    this.err_code = "001";
    this.description = "CUSTOM ALIAS ALREADY EXISTS"
  }

}

module.exports = CustomAliasAlreadyExistsException

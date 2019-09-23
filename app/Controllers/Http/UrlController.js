'use strict'
const crypto = require('crypto');
const Redis = use('Redis')
const Logger = use('Logger')
const Statistics = require('../../Models/Statistics')

const InvalidURLException = require('../../Models/Exceptions/InvalidURLException')
const CustomAliasAlreadyExistsException = require('../../Models/Exceptions/CustomAliasAlreadyExistsException')
const URLNotFoundException = require('../../Models/Exceptions/URLNotFoundException')
const MissingHTTPLException = require('../../Models/Exceptions/InvalidURLException')


//HTTP/HTTPS regex
const regex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

class UrlController {


  /**
   * Shorten an URL based on given alias.
   *
   * @param {*} {request, response}
   * @returns
   * @memberof UrlController
   */
  async shortenUrl({request, response}) {
    const body = request.post();
    const statistics = new Statistics();

    if (!body.url) { return new InvalidURLException() }
    if (!body.url.match(regex)) { return new InvalidURLException() }
    let url = body.url.toLowerCase();

    let alias = this.shorten(url);

    if (body.custom_alias) {
      alias = this.parseCustomAlias(body.custom_alias);
      if (await this.aliasExistInRedis(alias)) { return new CustomAliasAlreadyExistsException(alias) }
    }

    if (!await this.aliasExistInRedis(alias)) {
      Logger.info('Generating new hash, %s', alias);
      await Redis.hset(alias, 'long_url', url);
      await Redis.hset(alias, 'visits', 0);
      await Redis.set(body.url, alias);
    }
    else {
      Logger.info('Alias hash found in database, %s', alias);
    }


    return  {
      'url': url,
      'alias': alias,
      'statistics': {
        'time_taken': statistics.calculate()
      }
    }

  }



  /**
   * Retrieves a URL from redis based on given alias.
   *
   * @param {*} {request, response, params}
   * @returns
   * @memberof UrlController
   */
  async retrieve({request, response, params}) {
    let alias = params.alias;

    console.log(alias);

    if (!this.aliasExistInRedis(alias)) {
      return new URLNotFoundException();
    }

    let url = await Redis.hget(alias, 'long_url');
    await Redis.hincrby(alias, 'visits', 1);
    const visits = await Redis.hget(alias, 'visits');

    return {
      "visits": visits,
      "alias": alias,
      "url": url
    }

  }

  /**********************************************************************************************************************
  *                                                   HELPER FUNCTIONS
  **********************************************************************************************************************/

async aliasExistInRedis(alias) {
  return await Redis.hexists(alias, 'long_url') ? true : false;
}


shorten(url) {
  const hash = crypto.createHash('md5').update(url).digest('base64').replace(/\//g, '_').replace(/\+/g, '_');
  return hash.substring(0, 7);
}

parseCustomAlias(alias) {
  return alias.substring(0,7).replace(" ", '_').replace(/\//g, '_').replace(/\+/g, '_')
}


/**
 * Algorithm to generate alias based on 62 characters [a-Z, 0-9] using pseudorandom numbers.
 *
 * @returns
 * @memberof UrlController
 */
generateAlias() {
  const characters_allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let alias = ""

  for (let i = 0; i < 7; i++) {
    let index = parseInt(Math.random() * characters_allowed.length);
    alias += characters_allowed[index];
  }

  return alias
}


}

module.exports = UrlController

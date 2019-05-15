var steem = require("steem")
var fs = require('fs')
var logger = fs.createWriteStream('airdrop.csv', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})
const { Parser } = require('json2csv');
const fields = ['author', 'permlink', 'created', 'children', 'total_payout_value', 'curator_payout_value', 'pending_payout_value', 'nbVotes'];
const opts = { fields };
const parser = new Parser(opts)

query = {
  tag: process.env.TAG,
  limit: 100
}

var recipients = {}

getStuff()

function getStuff(author, permlink) {
  query.start_author = author
  query.start_permlink = permlink
  steem.api.getDiscussionsByCreated(query, function(err, result) {
    console.log(result[0].created, Object.keys(recipients).length)
    for(i=0; i<result.length;i++) {
      var thune = parseInt(result[i].total_payout_value.replace(' SBD', ''))
      thune += parseInt(result[i].curator_payout_value.replace(' SBD', ''))
      thune += parseInt(result[i].pending_payout_value.replace(' SBD', ''))
      winPoints(result[i].author, thune)
      var total_rshares = 0
      for (let y = 0; y < result[i].active_votes.length; y++) {
        total_rshares += parseInt(result[i].active_votes[y].rshares)
      }
      for (let y = 0; y < result[i].active_votes.length; y++) {
        winPoints(result[i].active_votes[y].voter, thune*parseInt(result[i].active_votes[y].rshares)/total_rshares)
      }
    }
    if (result.length < 100 || new Date(result[0].created).getTime() < 1546300800000) {
      fin()
    } else {
      getStuff(result[result.length-1].author, result[result.length-1].permlink)
    }
  });
}

function winPoints(author, amount) {
  if (amount <= 0) return
  if (isNaN(amount)) return
  if (recipients[author])
    recipients[author] += amount
  else 
    recipients[author] = amount
}

function fin() {
  for (const name in recipients) {
    logger.write(name+','+recipients[name]+'\n')
  }
}
const request = require('request')
const cheerio = require('cheerio')
const sendmail = require('sendmail')()

const url = ({title, author}) => {
  return encodeURI(`https://search.mlp.cz/cz/?query=${title} ${author}`)
}

const books = [
 {
   title: 'Správní právo',
   author: 'Dušan Hendrych',
   stock: 13
 },
 {
   title: 'Hluboká práce',
   author: 'Cal Newport',
   stock: 0
 },
 {
   title: 'Superprognózy',
   author: 'Philip Tetlock',
   stock: 0
 },
]

books.forEach((book) => {
  request(url(book), (error, response, body) => {
    if (!error) {
      const $ = cheerio.load(body)
      if ($('.listoftitles-noresults > h2').html() !== null) { // If 'Nebyly nalezeny žádné výsledky'
        console.log(`No new results for ${book.title}`)
      } else { // Check if there are new version of books on stock
        const numResults = parseInt($('.listoftitles-left > strong').html())
        const newResults = numResults - book.stock
        console.log(`Found ${newResults} new results of ${numResults} for ${book.title}`)
        if(newResults > 0) {
          notify(book.title)
        }
      }
    } else {
      console.log("Something went wrong: " + error)
    }
  })
})


 const notify = (title) => { // Sendmail is too basic, you should filter messages from sender not to go to spam in gmail
   sendmail({
       from: 'daemon@localhost.desktop',
       to: 'o.stanek@gmail.com',
       subject: `New book ${title} on stock`,
       html: `You should reserve it or run into the library ASAP.`
     }, (err) => {
       console.log(err)
   })
 }

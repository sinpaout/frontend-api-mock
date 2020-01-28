import $ from 'jquery'
import api from './api'

$('<h1>Star wars peoples</h1>').appendTo('body')
const $table = $('<table>').appendTo('body')
const $header = $('<tr>').appendTo($table)

$header.append('<th>Name</th>')
$header.append('<th>Gender</th>')
$header.append('<th>Birth year</th>')
$header.append('<th>Eye color</th>')

api.get('https://swapi.co/api/people/?format=json').then((response) => {
  if (!response.data.results.length) {
    const $tr = $('<tr>').appendTo($table)
    $tr.append(`<td colspan='100' style="text-align:center;color:red;">Data not found</td>`)
    return
  }
  response.data.results.forEach(people => {
    const $tr = $('<tr>').appendTo($table)
    $tr.append(`<td>${people.name}</td>`)
    $tr.append(`<td>${people.gender}</td>`)
    $tr.append(`<td>${people.birth_year}</td>`)
    $tr.append(`<td>${people.eye_color}</td>`)
  })
})

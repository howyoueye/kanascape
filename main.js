const kana = document.getElementsByClassName('kana')[0];
const results = document.getElementsByClassName('results')[0];
const query = document.getElementsByClassName('query')[0];

let kanaGroups = [];
let groups = [];
let allKanji = [];

let estate = {
  query: '',
  prevQuery: '',
  alphabet: 1,
  kanji: [],
  view: 0,
  matches: [],
  filter: 'reading'
}

function fillGroup(divisor, className) {
  for (let i = 0; i < kanaGroups.length; i++) {
    let kanaRow = document.createElement('div');
    kanaRow.classList.add(className);

    if (divisor == 9) {
      if (i == kanaGroups.length - 1) {
        kanaRow.classList.add('kana-row-final');
      }
    }

    for (let j = 0; j < kanaGroups[i].length; j++) {
      let kanaBox = document.createElement('div');
      kanaBox.classList.add('kana-box');
      kanaBox.innerHTML = kanaGroups[i][j][1];
      kanaBox.addEventListener('click', updateQuery);
      kanaRow.appendChild(kanaBox);
    }

    kana.appendChild(kanaRow);
  }
}

function insertKana(kanaArray, divisor, className) {
  kanaArray.forEach((group, idx) => {
    groups.push(group);
    if ((idx + 1) % divisor == 0) {
      kanaGroups.push(groups);
      groups = [];
    } else if (idx + 1 == kanaArray.length) {
      kanaGroups.push(groups);
    }
  });

  fillGroup(divisor, className);
}

function reverseString(str) {
	return (str === '') ? '' : reverseString(str.substr(1)) + str.charAt(0);
}

function restyleKana(target) {
  if (!target.classList.contains('kana-box-active')) {
    target.classList.add('kana-box-active');
  } else {
    target.classList.remove('kana-box-active');
  }
}

function updateQuery(event) {
	let clickedKana = event.target.textContent;
  let queryEnd = estate.query != '' ? estate.query[estate.query.length - 1] : '';
	let action = `${queryEnd == clickedKana ? 'delete' : 'add'}`;
	
  if (action == 'add') {
		estate.query = estate.query + clickedKana;
	} else if (action == 'delete') {
		if (estate.query.length == 1) {
			estate.query = '';
		} else {
    	estate.query = reverseString(reverseString(estate.query).replace(clickedKana, ''));
		}
	}

	query.value = estate.query;
  restyleKana(event.target);
	updateResults(estate.query);
}

function updateResults(event) {
  estate.matches = [];

  if (estate.query != '') {
    for (let i = 0; i < estate.kanji[0].length; i++) {
      checkMatch(estate.kanji[0][i].kanji, i);
    }
  } else {
    clearResults();
  }

  renderResults();
}

function checkMatch(kanji, i) {
  let theKanji = kanji[0];
  let on = kanji[1];
  let kun = kanji[2];

  // if (on.includes(estate.query) || kun.includes(estate.query)) {
  //   if (!inMatches(theKanji)) {
  //     estate.matches.push(estate.kanji[0][i]);
  //   }
  // }

  if (on == estate.query) {
    if (!inMatches(theKanji)) {
      estate.matches.push(estate.kanji[0][i]);
    }
  }
}

function inMatches(kanji) {
  for (let i = 0; i < estate.matches.length; i++) {
    if (kanji == estate.matches[i].kanji[0]) {
      return true;
    }
  }
  return false;
}

function renderResults() {
  let resultsHTML = '';
	for (let m = 0; m < estate.matches.length; m++) {
    resultsHTML += `
		  <div class="scape-row layout-3">
	      <div class="scape-box kanji reading-view">
          ${estate.matches[m].kanji[0]}
        </div>
	      <div class="scape-box reading">
	        <div class="scape-box on-yomi">
            ${estate.matches[m].kanji[1]}
          </div>
	        <div class="scape-box kun-yomi">
            ${estate.matches[m].kanji[2]}
          </div>
	      </div>
	      <div class="scape-box meaning">
          ${estate.matches[m].kanji[3]}
        </div>
	    </div>
		`
	}
  results.innerHTML = resultsHTML;
}

function clearResults() {
  while (results.firstChild) {
    results.removeChild(results.firstChild);
  }
}

async function fetchKanji() {  
  await fetch('https://kanji-data.herokuapp.com/n5kanji')
    .then(res => { return res.json() })
    .then(data => { 
      console.log(data);
      estate.kanji = data.kanji['n5']
      localStorage.setItem('kanji', JSON.stringify(estate.kanji))
      localStorage.setItem('fetched', true);
    })
    .catch(err => { console.log(err) })
}

function init() {
  // if (localStorage.getItem('fetched')) {
  //   estate.kanji = JSON.parse(localStorage.getItem('kanji'));
  //   estate.kanji = estate.kanji[0];

  // } else {
  //   fetchKanji();
  // }

  fetchKanji();

  if (window.innerWidth > 800) {
    insertKana(kanaPrimary, 5, 'kana-row');
  } else {
    insertKana(kanaSecondary, 9, 'kana-row-secondary');
  }

  query.addEventListener('change', updateResults);
}

window.onload = init();
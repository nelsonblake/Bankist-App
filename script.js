'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Adam Lefaivre',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-11-18T21:31:17.178Z',
    '2020-12-23T07:42:02.383Z',
    '2021-01-28T09:15:04.904Z',
    '2021-04-01T10:17:24.185Z',
    '2021-01-08T14:11:59.604Z',
    '2021-05-19T17:01:17.194Z',
    '2021-05-20T23:36:17.929Z',
    '2021-05-21T08:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account2 = {
  owner: 'Blake Nelson',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2020-11-01T13:15:33.035Z',
    '2020-11-30T09:48:16.867Z',
    '2020-12-25T06:04:23.907Z',
    '2021-01-25T14:18:46.235Z',
    '2021-02-05T16:33:06.386Z',
    '2021-04-10T14:43:26.374Z',
    '2021-05-20T18:49:59.371Z',
    '2021-04-26T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const labelLoginError = document.querySelector('.login__error');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
//Functions

/////////////////////////////////////////////////
//Format dates
function formatMovementDate(date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${month}/${day}/${year}`;

    //using Intl instead
    //dont need options for simply date
    return new Intl.DateTimeFormat(locale).format(date);
  }
}

///////////////////////////////////////////////
//format currency
function formatCurrency(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

///////////////////////////////////////////////
//display movements
function displayMovements(acc, sort = false) {
  //set container to empty
  containerMovements.innerHTML = '';

  //setting up a flag for when the user clicks sort
  const moves = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  moves.forEach(function (move, i) {
    //determine if deposit or withdrawal
    const type = move > 0 ? 'deposit' : 'withdrawal';
    //replace hardcode html with variables

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMove = formatCurrency(move, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMove}</div>
      </div>
      `;
    //place the new htmls in the container
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

//////////////////////////////////////////
//calculate and display balance
function calcDisplayBalance(acc) {
  //add balance to object
  acc.balance = acc.movements.reduce((acc, move) => acc + move, 0);

  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
}

/////////////////////////////////////////////
//calculate and display the various summaries
function calcDisplaySummary(acc) {
  //income total
  const incomes = acc.movements
    //filter by positives
    .filter(move => move > 0)
    //sum a total
    .reduce((acc, move) => acc + move, 0);
  //set text
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  //out total
  const out = acc.movements
    //filter by negatives
    .filter(move => move < 0)
    //sum a total
    .reduce((acc, move) => acc + move, 0);
  //set text
  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  //total interest
  const interest = acc.movements
    //filter by positives
    .filter(move => move > 0)
    //calculate percent
    .map(deposit => (deposit * acc.interestRate) / 100)
    //bank only takes interest above 1%
    .filter(int => int >= 1)
    //sum a total
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
}

///////////////////////////////////////////
//convert name into login initials
function createUsernames(accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      //return first letter
      .map(function (name) {
        return name[0];
      })
      .join('');
  });
}
createUsernames(accounts);

////////////////////////////////////////////
//update UI
function updateUI(acc) {
  //display movements
  displayMovements(acc);
  //display balance
  calcDisplayBalance(acc);
  //display summary
  calcDisplaySummary(acc);
}

/////////////////////////////////////////////
//Error messages when nputting wrong data
function timeoutMessage(message) {
  setTimeout(function () {
    labelWelcome.textContent = message;
  }, 2500);
}

//////////////////////////////////////////////
//logout timer
function logoutTimer() {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //each call print remaining time
    labelTimer.textContent = `${min}:${sec}`;

    //at 0, stop timer and logout
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
      isHidden = true;
      currentAccount = undefined;
    }

    //decrease
    --time;
  };

  // set timer to 5 minutes
  let time = 300;
  //call timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

//function for clearing fields
function clearTransferFields() {
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
}
function clearLoanField() {
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
}
function clearCloseFields() {
  inputClosePin.value = inputCloseUsername.value = '';
  inputClosePin.blur();
}
function finitePIN(pin) {
  if (!Number.isFinite(pin)) {
    labelWelcome.textContent = 'Pin can only contain numbers';
    timeoutMessage('Log in to get started');
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
  }
  return !Number.isFinite(pin);
}
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
//Event handler
let currentAccount, timer, isHidden;

///////////////////////////////////////////////
//Login
btnLogin.addEventListener('click', function (e) {
  //when you use a button in a form element the page reload, so we must stop that
  //hitting enter in a form will equal a click
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  //make sure input is a number
  if (finitePIN(+inputLoginPin.value)) {
    containerApp.style.opacity = 0;
    isHidden = true;
    return;
  }
  // if (!Number.isFinite(+inputLoginPin.value)) {
  //   console.log('HERE');
  //   labelWelcome.textContent = 'Pin can only contain numbers';
  //   timeoutMessage('Log in to get started');
  //   inputLoginUsername.value = inputLoginPin.value = '';
  //   inputLoginPin.blur();
  //   return;
  // }

  if (currentAccount?.pin === +inputLoginPin.value) {
    //display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    //fade in
    containerApp.style.opacity = 100;
    isHidden = false;
    //create date and time using INTL
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //2-digit = 00
      year: 'numeric',
    };

    //set the date format to individual country format
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //hide credentials after login
    inputLoginUsername.value = inputLoginPin.value = '';
    //lose focus on form
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = logoutTimer();

    //update ui
    updateUI(currentAccount);
  } else {
    //hide and give error
    containerApp.style.opacity = 0;
    isHidden = true;
    labelWelcome.textContent = 'Wrong username or password';
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    timeoutMessage('Log in to get started');
  }
});

/////////////////////////////////////////////////
//Transfer event
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  //check if the content is hidden before allowing user to do anything
  if (isHidden === false) {
    //get the amount and the receiving account
    const amount = +inputTransferAmount.value;
    const receiverAcc = accounts.find(
      acc => acc.username === inputTransferTo.value
    );
    //clear fields
    clearTransferFields();

    //checks
    if (
      amount > 0 &&
      receiverAcc &&
      currentAccount.balance >= amount &&
      receiverAcc?.username !== currentAccount.username
    ) {
      //negative movement to receiver
      currentAccount.movements.push(-amount);
      //positive movement to receiver
      receiverAcc.movements.push(amount);

      //add transfer date
      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());

      //update ui
      updateUI(currentAccount);

      //reset timer
      clearInterval(timer);
      timer = logoutTimer();
    } else {
      labelWelcome.textContent = 'Invalid transfer request';
      timeoutMessage(`Welcome back, ${currentAccount.owner.split(' ')[0]}`);
    }
  } else {
    //clear fields
    clearTransferFields();
  }
});

///////////////////////////////////////////////////////
//Request Loan
//only gives loan if any deposit is > 10% of the requested loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  //check if the content is hidden before allowing user to do anything
  if (isHidden === false) {
    const request = Math.floor(inputLoanAmount.value);
    if (
      request > 0 &&
      currentAccount.movements.some(move => move >= request / 10)
    ) {
      //reset timer
      clearInterval(timer);
      timer = logoutTimer();

      setTimeout(function () {
        //add deposit
        currentAccount.movements.push(request);

        //add loan date
        currentAccount.movementsDates.push(new Date().toISOString());

        //update ui
        updateUI(currentAccount);
      }, 2500);
    } else {
      labelWelcome.textContent = 'Invalid loan request';
      timeoutMessage(`Welcome back, ${currentAccount.owner.split(' ')[0]}`);
    }
    //clear field
    clearLoanField();
  } else {
    //clear field
    clearLoanField();
  }
});

/////////////////////////////////////////////////////////
//Close account event
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  //check if the content is hidden before allowing user to do anything
  if (isHidden === false) {
    //checks
    if (finitePIN(+inputClosePin.value)) return;

    if (
      inputCloseUsername.value === currentAccount.username &&
      +inputClosePin.value === currentAccount.pin
    ) {
      //do deleteion and hide UI
      const index = accounts.findIndex(
        acc => acc.username === currentAccount.username
      );
      accounts.splice(index, 1);
      containerApp.style.opacity = 0;

      labelWelcome.textContent = 'Account closed';
      timeoutMessage('Log in to get started');
    } else {
      labelWelcome.textContent = 'Invalid close request';
      timeoutMessage(`Welcome back, ${currentAccount.owner.split(' ')[0]}`);
    }
    //clear fields
    clearCloseFields();
  } else {
    //clear fields
    clearCloseFields();
  }
});

////////////////////////////////////////////////////
//Sort
let isSorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  //check if the content is hidden before allowing user to do anything
  if (isHidden === false) {
    displayMovements(currentAccount, !isSorted);
    isSorted = !isSorted;
  }
});

////////////////////////////////////////////////////
//mouse reset timer
//reset timer anytime you cmove the mouse
document.querySelector('body').addEventListener('mousemove', function () {
  clearInterval(timer);
  timer = logoutTimer();
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// //numbers are binary
// console.log(23 === 23.0);
// //error in Javascript. binary simply cannot represent certain fractions well
// console.log(0.1 + 0.2 === 0.3);

// //implicit conversion of string to number
// console.log(Number('23'));
// console.log(+'23');

// //Parsing - second argument is the base number system
// console.log(Number.parseInt('30px', 10)); //string must start with a number
// console.log(Number.parseInt('2.5rem'));
// console.log(Number.parseFloat('2.5rem'));

// //only for checking exactly NaN
// //isNaN
// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20x'));
// console.log(Number.isNaN(23 / 0));

// console.log('----------------');

// //Much better for checking numbers
// //isFinite
// console.log(Number.isFinite(20));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20x'));
// console.log(Number.isFinite(23 / 0));
// //there is also isInteger

// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2)); //sqrt
// console.log(8 ** (1 / 3)); //cubic root

// console.log(Math.max('5', 6, 7, 8, 20, 1, 2, 3, 4));
// console.log(Math.min('5', 6, 7, 8, 20, 1, 2, 3, 4));

// //calculate area of a circle with a certain radius
// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

// //random int in the range - works with negatives too
// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;

// console.log(randomInt(2, 50));

// //Rounding Ints
// //all do type conversion
// console.log('----Trunc----');
// console.log(Math.trunc(23.3));
// console.log(Math.trunc(23.9));
// console.log('----Round----');
// console.log(Math.round(23.9));
// console.log(Math.round(23.1));
// console.log('----Ceiling----');
// console.log(Math.ceil(23.9));
// console.log(Math.ceil(23.1));
// console.log('----Floor----');
// console.log(Math.floor(23.9));
// console.log(Math.floor(23.1));
// console.log('----Trunc vs Floor----');
// console.log(Math.trunc(-23.1));
// console.log(Math.floor(-23.1));

// //Rounding Floating point
// //toFixed returns string
// console.log(+(2.7).toFixed(3));
// console.log(+(23.2567).toFixed(2));

// //Remainder operator
// console.log(5 % 2);

// const isEven = n => n % 2 === 0;
// console.log(isEven(8));
// console.log(isEven(1));
// console.log(isEven(25));

// //change everyother row to red when clicking balance and every third row to blue
// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//     if (i % 3 === 0) row.style.backgroundColor = 'blue';
//   });
// });

/////////////////////////////////////////////
// //BigInt
// //Cannot use Math function on bigint
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// //will lose precision on numbers higher than this

// console.log(938579847592837593485793845793847598347598n);

// //operator still work the same
// console.log(2938409n + 234283498237492834n);

// //doesnt mix so must use BigInt()
// console.log(984375934752357678435n + BigInt(23));

// console.log(20n > 15);
// console.log(20n === 20);
// //one exception for loose equality
// console.log(20n == 20);

// //division
// console.log(10n / 3n);
// console.log(12n / 3n);
// console.log(10 / 3);

/////////////////////////////////////////////
//Dates and Times

//create a date
// const now = new Date();
// console.log(now);

// //somewhat unreliable to hardcode strings here
// console.log(new Date('May 20 2021 15:23:33'));
// console.log(new Date('December 24, 2015'));

// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 19, 15, 13, 50));
// //nov 32 doesnt exist so it goes to next day
// console.log(new Date(2037, 10, 32));

// console.log(new Date(0));
// //days to milliseconds for 3 days
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// //working with dates
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.getMilliseconds());
// console.log(future.toISOString());
// //milliseconds since Jan 1 1970
// console.log(future.getTime());
// console.log(Date.now());

// //all the getters have setters
// future.setFullYear(2040);
// console.log(future);

// const future = new Date(2037, 10, 19, 15, 23);

// //timestamp in milliseconds
// console.log(+future);

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// const days1 = calcDaysPassed(
//   new Date(2037, 3, 14),
//   new Date(2037, 3, 4, 10, 8)
// );
// console.log(days1);

///////////////////////////////////////////////
// //Internationalization API

// const num = 98327.23;

// //testing different options
// const options = {
//   //all 3 styles
//   // style: 'unit',
//   // style: 'percent',
//   style: 'currency',
//   unit: 'mile-per-hour',

//   //must set currency if you use it as a style
//   currency: 'EUR',

//   //useGrouping: false
// };

// console.log('US:   ', new Intl.NumberFormat('en-US', options).format(num));
// console.log('Germany:   ', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('Syria:   ', new Intl.NumberFormat('ar-SY', options).format(num));

// //navigator.language is your locale code
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language, options).format(num)
// );

///////////////////////////////////////////////////
//Set Timeout

// //Asynchronous JavaScript
// //call func 3 seconds later
// const ingredients = ['olives', 'spinach'];
// const pizzaTime = setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
//   3000,
//   ...ingredients
// );
// console.log('Waiting...');

// //can cancel timeout within the time
// if (ingredients.includes('spinach')) clearTimeout(pizzaTime);

// //set Interval
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   second: 'numeric',
// };

// //make a little clock that displays every second
// setInterval(() => {
//   const now = new Date();
//   console.log(new Intl.DateTimeFormat('us-EN', options).format(now));
// }, 1000);

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Unpackage imports
var Web3Modal = window.Web3Modal.default;
var WalletConnectProvider = window.WalletConnectProvider.default;
var EvmChains = window.EvmChains;
var Fortmatic = window.Fortmatic;
var Torus = window.Torus;
var Portis = window.Portis;
var Authereum = window.Authereum;
App = {
  web3: null,
  web3Modal: null,
  web3Provider: null,
  accounts: [],
  selectedAccount: null,
  contracts: {},
  init: function init() {
    App.initChartColors();
    App.initAprChart();
    App.initWeb3();
    App.bindEvents();
  },
  initChartColors: function initChartColors() {
    window.chartColors = {
      red: 'rgb(255, 99, 132)',
      orange: 'rgb(255, 159, 64)',
      yellow: 'rgb(255, 205, 86)',
      green: 'rgb(75, 192, 192)',
      blue: 'rgb(54, 162, 235)',
      purple: 'rgb(153, 102, 255)',
      grey: 'rgb(201, 203, 207)'
    };
  },
  initAprChart: function initAprChart() {
    var compoundData = {};
    var dydxData = {};
    var epoch = Math.floor(new Date().getTime() / 1000);
    var epochOneYearAgo = epoch - 86400 * 365;
    Promise.all([$.getJSON("dydx-aprs.json"), $.getJSON("https://api.compound.finance/api/v2/market_history/graph?asset=0x5d3a536e4d6dbd6114cc1ead35777bab948e3643&min_block_timestamp=" + epochOneYearAgo + "&max_block_timestamp=" + epoch + "&num_buckets=365"), $.getJSON("https://api.compound.finance/api/v2/market_history/graph?asset=0x39AA39c021dfbaE8faC545936693aC917d5E7563&min_block_timestamp=" + epochOneYearAgo + "&max_block_timestamp=" + epoch + "&num_buckets=365"), $.getJSON("https://api.compound.finance/api/v2/market_history/graph?asset=0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9&min_block_timestamp=" + epochOneYearAgo + "&max_block_timestamp=" + epoch + "&num_buckets=365")]).then(function (values) {
      var ourData = {};
      var dydxAvgs = [];
      var epochs = Object.keys(values[0]).sort();

      for (var i = 0; i < epochs.length; i++) {
        // Calculate average for dYdX graph and max for our graph
        var sum = 0;
        var max = 0;

        for (var _i = 0, _Object$keys = Object.keys(values[0][epochs[i]]); _i < _Object$keys.length; _i++) {
          var currencyCode = _Object$keys[_i];
          sum += values[0][epochs[i]][currencyCode];
          if (values[0][epochs[i]][currencyCode] > max) max = values[0][epochs[i]][currencyCode];
        }

        dydxAvgs.push({
          t: new Date(parseInt(epochs[i])),
          y: sum / Object.keys(values[0][epochs[i]]).length * 100
        }); // Add data for Rari graph

        var flooredEpoch = Math.floor(epochs[i] / 86400 / 1000) * 86400 * 1000;
        ourData[flooredEpoch] = max;
      }

      for (var i = 0; i < values[1].supply_rates.length; i++) {
        var rateEpoch = values[1].supply_rates[i].block_timestamp * 1000;
        if (compoundData[rateEpoch] === undefined) compoundData[rateEpoch] = [];
        compoundData[rateEpoch].push(values[1].supply_rates[i].rate);
      }

      for (var i = 0; i < values[2].supply_rates.length; i++) {
        var rateEpoch = values[2].supply_rates[i].block_timestamp * 1000;
        if (compoundData[rateEpoch] === undefined) compoundData[rateEpoch] = [];
        compoundData[rateEpoch].push(values[2].supply_rates[i].rate);
      }

      for (var i = 0; i < values[3].supply_rates.length; i++) {
        var rateEpoch = values[3].supply_rates[i].block_timestamp * 1000;
        if (compoundData[rateEpoch] === undefined) compoundData[rateEpoch] = [];
        compoundData[rateEpoch].push(values[3].supply_rates[i].rate);
      }

      var compoundAvgs = [];
      var epochs = Object.keys(compoundData).sort();

      for (var i = 0; i < epochs.length; i++) {
        // Calculate average for Compound graph and max for our graph
        var sum = 0;
        var max = 0;

        for (var j = 0; j < compoundData[epochs[i]].length; j++) {
          sum += compoundData[epochs[i]][j];
          if (compoundData[epochs[i]][j] > max) max = compoundData[epochs[i]][j];
        }

        var avg = sum / compoundData[epochs[i]].length;
        compoundAvgs.push({
          t: new Date(parseInt(epochs[i])),
          y: avg * 100
        }); // Add data for Rari graph

        var flooredEpoch = Math.floor(epochs[i] / 86400 / 1000) * 86400 * 1000;
        if (ourData[flooredEpoch] === undefined || max > ourData[flooredEpoch]) ourData[flooredEpoch] = max;
      } // Turn Rari data into object for graph


      var ourAvgs = [];
      var epochs = Object.keys(ourData).sort();

      for (var i = 0; i < epochs.length; i++) {
        ourAvgs.push({
          t: new Date(parseInt(epochs[i])),
          y: ourData[epochs[i]] * 100
        });
      } // Display today's estimated APY
      // TODO: Display real APY


      $('#APYToday').text((ourData[epochs[epochs.length - 1]] * 100).toFixed(2) + "%"); // Init chart

      var ctx = document.getElementById('chart-aprs').getContext('2d');
      ctx.canvas.width = 1000;
      ctx.canvas.height = 300;
      var color = Chart.helpers.color;
      var cfg = {
        data: {
          datasets: [{
            label: 'Rari',
            backgroundColor: color(window.chartColors.green).alpha(0.5).rgbString(),
            borderColor: window.chartColors.green,
            data: ourAvgs,
            type: 'line',
            pointRadius: 0,
            fill: false,
            lineTension: 0,
            borderWidth: 2
          }, {
            label: 'dYdX',
            backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
            borderColor: window.chartColors.blue,
            data: dydxAvgs,
            type: 'line',
            pointRadius: 0,
            fill: false,
            lineTension: 0,
            borderWidth: 2
          }, {
            label: 'Compound',
            backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
            borderColor: window.chartColors.red,
            data: compoundAvgs,
            type: 'line',
            pointRadius: 0,
            fill: false,
            lineTension: 0,
            borderWidth: 2
          }]
        },
        options: {
          animation: {
            duration: 0
          },
          scales: {
            xAxes: [{
              type: 'time',
              distribution: 'series',
              offset: true,
              ticks: {
                major: {
                  enabled: true,
                  fontStyle: 'bold'
                },
                source: 'data',
                autoSkip: true,
                autoSkipPadding: 75,
                maxRotation: 0,
                sampleSize: 100
              },
              afterBuildTicks: function afterBuildTicks(scale, ticks) {
                var majorUnit = scale._majorUnit;
                var firstTick = ticks[0];
                var i, ilen, val, tick, currMajor, lastMajor;
                val = moment(ticks[0].value);

                if (majorUnit === 'minute' && val.second() === 0 || majorUnit === 'hour' && val.minute() === 0 || majorUnit === 'day' && val.hour() === 9 || majorUnit === 'month' && val.date() <= 3 && val.isoWeekday() === 1 || majorUnit === 'year' && val.month() === 0) {
                  firstTick.major = true;
                } else {
                  firstTick.major = false;
                }

                lastMajor = val.get(majorUnit);

                for (i = 1, ilen = ticks.length; i < ilen; i++) {
                  tick = ticks[i];
                  val = moment(tick.value);
                  currMajor = val.get(majorUnit);
                  tick.major = currMajor !== lastMajor;
                  lastMajor = currMajor;
                }

                return ticks;
              }
            }],
            yAxes: [{
              gridLines: {
                drawBorder: false
              },
              scaleLabel: {
                display: true,
                labelString: 'APY (%)'
              }
            }]
          },
          tooltips: {
            intersect: false,
            mode: 'index',
            callbacks: {
              label: function label(tooltipItem, myData) {
                var label = myData.datasets[tooltipItem.datasetIndex].label || '';

                if (label) {
                  label += ': ';
                }

                label += parseFloat(tooltipItem.value).toFixed(2) + "%";
                return label;
              }
            }
          }
        }
      };
      var chart = new Chart(ctx, cfg); // Convert APR chart data into return chart data

      var dydxReturns = [];
      var currentReturn = 10000;

      for (var i = 0; i < dydxAvgs.length; i++) {
        dydxReturns.push({
          t: dydxAvgs[i].t,
          y: currentReturn *= 1 + dydxAvgs[i].y / 100 / 365
        });
      }

      var compoundReturns = [];
      currentReturn = 10000;

      for (var i = 0; i < compoundAvgs.length; i++) {
        compoundReturns.push({
          t: compoundAvgs[i].t,
          y: currentReturn *= 1 + compoundAvgs[i].y / 100 / 365
        });
      }

      var ourReturns = [];
      currentReturn = 10000;

      for (var i = 0; i < ourAvgs.length; i++) {
        ourReturns.push({
          t: ourAvgs[i].t,
          y: currentReturn *= 1 + ourAvgs[i].y / 100 / 365
        });
      } // Init chart


      var ctx = document.getElementById('chart-return').getContext('2d');
      ctx.canvas.width = 1000;
      ctx.canvas.height = 300;
      var color = Chart.helpers.color;
      var cfg = {
        data: {
          datasets: [{
            label: 'Rari',
            backgroundColor: color(window.chartColors.green).alpha(0.5).rgbString(),
            borderColor: window.chartColors.green,
            data: ourReturns,
            type: 'line',
            pointRadius: 0,
            fill: false,
            lineTension: 0,
            borderWidth: 2
          }, {
            label: 'dYdX',
            backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
            borderColor: window.chartColors.blue,
            data: dydxReturns,
            type: 'line',
            pointRadius: 0,
            fill: false,
            lineTension: 0,
            borderWidth: 2
          }, {
            label: 'Compound',
            backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
            borderColor: window.chartColors.red,
            data: compoundReturns,
            type: 'line',
            pointRadius: 0,
            fill: false,
            lineTension: 0,
            borderWidth: 2
          }]
        },
        options: {
          animation: {
            duration: 0
          },
          scales: {
            xAxes: [{
              type: 'time',
              distribution: 'series',
              offset: true,
              ticks: {
                major: {
                  enabled: true,
                  fontStyle: 'bold'
                },
                source: 'data',
                autoSkip: true,
                autoSkipPadding: 75,
                maxRotation: 0,
                sampleSize: 100
              },
              afterBuildTicks: function afterBuildTicks(scale, ticks) {
                var majorUnit = scale._majorUnit;
                var firstTick = ticks[0];
                var i, ilen, val, tick, currMajor, lastMajor;
                val = moment(ticks[0].value);

                if (majorUnit === 'minute' && val.second() === 0 || majorUnit === 'hour' && val.minute() === 0 || majorUnit === 'day' && val.hour() === 9 || majorUnit === 'month' && val.date() <= 3 && val.isoWeekday() === 1 || majorUnit === 'year' && val.month() === 0) {
                  firstTick.major = true;
                } else {
                  firstTick.major = false;
                }

                lastMajor = val.get(majorUnit);

                for (i = 1, ilen = ticks.length; i < ilen; i++) {
                  tick = ticks[i];
                  val = moment(tick.value);
                  currMajor = val.get(majorUnit);
                  tick.major = currMajor !== lastMajor;
                  lastMajor = currMajor;
                }

                return ticks;
              }
            }],
            yAxes: [{
              gridLines: {
                drawBorder: false
              },
              scaleLabel: {
                display: true,
                labelString: 'Balance (USD)'
              }
            }]
          },
          tooltips: {
            intersect: false,
            mode: 'index',
            callbacks: {
              label: function label(tooltipItem, myData) {
                var label = myData.datasets[tooltipItem.datasetIndex].label || '';

                if (label) {
                  label += ': ';
                }

                label += "$" + parseFloat(tooltipItem.value).toFixed(2);
                return label;
              }
            }
          }
        }
      };
      var chart = new Chart(ctx, cfg);
    });
  },

  /**
   * Initialize Web3Modal.
   */
  initWeb3Modal: function initWeb3Modal() {
    var providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "c52a3970da0a47978bee0fe7988b67b6"
        }
      },
      fortmatic: {
        package: Fortmatic,
        options: {
          key: "pk_live_F95FEECB1BE324B5" // TODO: Replace API key

        }
      },
      torus: {
        package: Torus,
        options: {}
      },
      portis: {
        package: Portis,
        options: {
          id: "7e4ce7f9-7cd0-42da-a634-44e682aacd73" // TODO: Replace API key

        }
      },
      authereum: {
        package: Authereum,
        options: {}
      }
    };
    App.web3Modal = new Web3Modal({
      cacheProvider: false,
      // optional
      providerOptions: providerOptions // required

    });
  },

  /**
   * Kick in the UI action after Web3modal dialog has chosen a provider
   */
  fetchAccountData: function () {
    var _fetchAccountData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var chainId, i;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // Get a Web3 instance for the wallet
              App.web3 = new Web3(App.web3Provider); // Get connected chain ID from Ethereum node

              _context.next = 3;
              return App.web3.eth.getChainId();

            case 3:
              chainId = _context.sent;
              _context.next = 6;
              return App.web3.eth.getAccounts();

            case 6:
              App.accounts = _context.sent;
              App.selectedAccount = App.accounts[0]; // Get user's account balance in the quant fund and RFT balance

              if (App.contracts.RariFundManager) {
                App.getMyFundBalance();
                if (!App.intervalGetMyFundBalance) App.intervalGetMyFundBalance = setInterval(App.getMyFundBalance, 5 * 60 * 1000);
              }

              if (App.contracts.RariFundToken) {
                App.getTokenBalance();
                if (!App.intervalGetTokenBalance) App.intervalGetTokenBalance = setInterval(App.getTokenBalance, 5 * 60 * 1000);
              } // Load acounts dropdown


              $('#selected-account').empty();

              for (i = 0; i < App.accounts.length; i++) {
                $('#selected-account').append('<option' + (i == 0 ? ' selected' : '') + '>' + App.accounts[i] + '</option>');
              } // Display fully loaded UI for wallet data


              $('#depositButton, #withdrawButton, #transferButton').prop("disabled", false);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function fetchAccountData() {
      return _fetchAccountData.apply(this, arguments);
    }

    return fetchAccountData;
  }(),

  /**
   * Fetch account data for UI when
   * - User switches accounts in wallet
   * - User switches networks in wallet
   * - User connects wallet initially
   */
  refreshAccountData: function () {
    var _refreshAccountData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // If any current data is displayed when
              // the user is switching acounts in the wallet
              // immediate hide this data
              $("#MyDAIBalance, #MyUSDCBalance, #MyUSDTBalance, #RFTBalance").text("?"); // Disable button while UI is loading.
              // fetchAccountData() will take a while as it communicates
              // with Ethereum node via JSON-RPC and loads chain data
              // over an API call.

              $("#btn-connect").text("Loading...");
              $("#btn-connect").prop("disabled", true);
              _context2.next = 5;
              return App.fetchAccountData();

            case 5:
              $("#btn-connect").hide();
              $("#btn-connect").text("Connect");
              $("#btn-connect").prop("disabled", false);
              $("#btn-disconnect").show();

            case 9:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    function refreshAccountData() {
      return _refreshAccountData.apply(this, arguments);
    }

    return refreshAccountData;
  }(),

  /**
   * Connect wallet button pressed.
   */
  connectWallet: function () {
    var _connectWallet = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // Setting this null forces to show the dialogue every time
              // regardless if we play around with a cacheProvider settings
              // in our localhost.
              // TODO: A clean API needed here
              App.web3Modal.providerController.cachedProvider = null;
              _context3.prev = 1;
              _context3.next = 4;
              return App.web3Modal.connect();

            case 4:
              App.web3Provider = _context3.sent;
              _context3.next = 11;
              break;

            case 7:
              _context3.prev = 7;
              _context3.t0 = _context3["catch"](1);
              console.error("Could not get a wallet connection", _context3.t0);
              return _context3.abrupt("return");

            case 11:
              // Subscribe to accounts change
              App.web3Provider.on("accountsChanged", function (accounts) {
                App.fetchAccountData();
              }); // Subscribe to chainId change

              App.web3Provider.on("chainChanged", function (chainId) {
                App.fetchAccountData();
              }); // Subscribe to networkId change

              App.web3Provider.on("networkChanged", function (networkId) {
                App.fetchAccountData();
              });
              _context3.next = 16;
              return App.refreshAccountData();

            case 16:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[1, 7]]);
    }));

    function connectWallet() {
      return _connectWallet.apply(this, arguments);
    }

    return connectWallet;
  }(),

  /**
   * Disconnect wallet button pressed.
   */
  disconnectWallet: function () {
    var _disconnectWallet = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              console.log("Killing the wallet connection", provider); // TODO: MetamaskInpageProvider does not provide disconnect?

              if (!provider.close) {
                _context4.next = 5;
                break;
              }

              _context4.next = 4;
              return provider.close();

            case 4:
              provider = null;

            case 5:
              selectedAccount = null; // Set the UI back to the initial state

              $("#selected-account").empty();
              $("#btn-disconnect").hide();
              $("#btn-connect").show();

            case 9:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    function disconnectWallet() {
      return _disconnectWallet.apply(this, arguments);
    }

    return disconnectWallet;
  }(),

  /**
   * Initialize the latest version of web3.js (MetaMask uses an oudated one that overwrites ours if we include it as an HTML tag), then initialize and connect Web3Modal.
   */
  initWeb3: function initWeb3() {
    $.getScript("js/web3.min.js", function () {
      if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
      } else {
        web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/c52a3970da0a47978bee0fe7988b67b6"));
      }

      App.initContracts();
      App.initWeb3Modal();
    });
  },

  /**
   * Initialize FundManager and FundToken contracts.
   */
  initContracts: function initContracts() {
    $.getJSON('abi/RariFundManager.json', function (data) {
      App.contracts.RariFundManager = new web3.eth.Contract(data, "0xa5E348898D6b55B9724Fba87eA709C7aDcF91cBc");
      App.getFundBalance();
      setInterval(App.getFundBalance, 5 * 60 * 1000);

      if (App.selectedAccount) {
        App.getMyFundBalance();
        if (!App.intervalGetMyFundBalance) App.intervalGetMyFundBalance = setInterval(App.getMyFundBalance, 5 * 60 * 1000);
      }

      App.getDirectlyDepositableCurrencies();
      App.getDirectlyWithdrawableCurrencies();
      setInterval(function () {
        App.getDirectlyDepositableCurrencies();
        App.getDirectlyWithdrawableCurrencies();
      }, 5 * 60 * 1000);
    });
    $.getJSON('abi/RariFundToken.json', function (data) {
      App.contracts.RariFundToken = new web3.eth.Contract(data, "0xF8bf0c88f3ebA7ab4aF9675231f4549082546791");

      if (App.selectedAccount) {
        App.getTokenBalance();
        if (!App.intervalGetTokenBalance) App.intervalGetTokenBalance = setInterval(App.getTokenBalance, 5 * 60 * 1000);
      }
    });
    $.getJSON('abi/RariFundProxy.json', function (data) {
      App.contracts.RariFundProxy = new web3.eth.Contract(data, "0x812D7380490bd22A957d9a81a49c1E3Ea296Ec48");
    });
    $.getJSON('abi/ERC20.json', function (data) {
      App.contracts.DAI = new web3.eth.Contract(data, "0x6B175474E89094C44Da98b954EedeAC495271d0F");
      App.contracts.USDC = new web3.eth.Contract(data, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
      App.contracts.USDT = new web3.eth.Contract(data, "0xdAC17F958D2ee523a2206206994597C13D831ec7");
    });
  },
  getDirectlyDepositableCurrencies: function getDirectlyDepositableCurrencies() {
    var _loop = function _loop() {
      var currencyCode = _arr[_i2];
      App.contracts.RariFundManager.methods.isCurrencyAccepted(currencyCode).call().then(function (accepted) {
        $('#DepositToken > option[value="' + currencyCode + '"]').text(currencyCode + (accepted ? " (no slippage)" : ""));
      });
    };

    for (var _i2 = 0, _arr = ["DAI", "USDC", "USDT"]; _i2 < _arr.length; _i2++) {
      _loop();
    }
  },
  getDirectlyWithdrawableCurrencies: function getDirectlyWithdrawableCurrencies() {
    var _loop2 = function _loop2() {
      var currencyCode = _arr2[_i3];
      App.contracts.RariFundManager.methods["getRawFundBalance(string)"](currencyCode).call().then(function (rawFundBalance) {
        $('#WithdrawToken > option[value="' + currencyCode + '"]').text(currencyCode + (parseFloat(rawFundBalance) > 0 ? " (no slippage up to " + (parseFloat(rawFundBalance) / (currencyCode === "DAI" ? 1e18 : 1e6)).toPrecision(4) + ")" : ""));
      });
    };

    for (var _i3 = 0, _arr2 = ["DAI", "USDC", "USDT"]; _i3 < _arr2.length; _i3++) {
      _loop2();
    }
  },

  /**
   * Bind button click events.
   */
  bindEvents: function bindEvents() {
    $(document).on('click', '#btn-connect', App.connectWallet);
    $(document).on('click', '#btn-disconnect', App.disconnectWallet);
    $(document).on('change', '#selected-account', function () {
      // Set selected account
      App.selectedAccount = $(this).val(); // Get user's account balance in the quant fund and RFT balance

      if (App.contracts.RariFundManager) {
        App.getMyFundBalance();
        if (!App.intervalGetMyFundBalance) App.intervalGetMyFundBalance = setInterval(App.getMyFundBalance, 5 * 60 * 1000);
      }

      if (App.contracts.RariFundToken) {
        App.getTokenBalance();
        if (!App.intervalGetTokenBalance) App.intervalGetTokenBalance = setInterval(App.getTokenBalance, 5 * 60 * 1000);
      }
    });
    $(document).on('change', '#DepositAmount', function () {
      $('#DepositSlippage').hide();
    });
    $(document).on('click', '#depositButton', App.handleDeposit);
    $(document).on('change', '#WithdrawAmount', function () {
      $('#WithdrawSlippage').hide();
    });
    $(document).on('click', '#withdrawButton', App.handleWithdraw);
    $(document).on('click', '#transferButton', App.handleTransfer);
  },
  get0xPrice: function get0xPrice(inputTokenSymbol, outputTokenSymbol) {
    return new Promise(function (resolve, reject) {
      $.getJSON('https://api.0x.org/swap/v0/prices?sellToken=' + inputTokenSymbol, function (decoded) {
        if (!decoded) reject("Failed to decode prices from 0x swap API");
        if (!decoded.records) reject("No prices found on 0x swap API");

        for (var i = 0; i < decoded.records.length; i++) {
          if (decoded.records[i].symbol === outputTokenSymbol) resolve(decoded.records[i].price);
        }

        reject("Price not found on 0x swap API");
      }).fail(function (err) {
        reject("Error requesting prices from 0x swap API: " + err.message);
      });
    });
  },
  get0xSwapOrders: function get0xSwapOrders(inputTokenAddress, outputTokenAddress, maxInputAmountBN, maxMakerAssetFillAmountBN) {
    return new Promise(function (resolve, reject) {
      $.getJSON('https://api.0x.org/swap/v0/quote?sellToken=' + inputTokenAddress + '&buyToken=' + outputTokenAddress + (maxMakerAssetFillAmountBN !== undefined ? '&buyAmount=' + maxMakerAssetFillAmountBN.toString() : '&sellAmount=' + maxInputAmountBN.toString()), function (decoded) {
        if (!decoded) reject("Failed to decode quote from 0x swap API");
        if (!decoded.orders) reject("No orders found on 0x swap API");
        decoded.orders.sort(function (a, b) {
          return a.makerAssetAmount / (a.takerAssetAmount + a.takerFee) < b.makerAssetAmount / (b.takerAssetAmount + b.takerFee) ? 1 : -1;
        });
        var orders = [];
        var inputFilledAmountBN = web3.utils.toBN(0);
        var takerAssetFilledAmountBN = web3.utils.toBN(0);
        var makerAssetFilledAmountBN = web3.utils.toBN(0);

        for (var i = 0; i < decoded.orders.length; i++) {
          if (decoded.orders[i].takerFee > 0 && decoded.orders[i].takerFeeAssetData !== "0xf47261b0000000000000000000000000" + inputTokenAddress) continue;
          var takerAssetAmountBN = web3.utils.toBN(decoded.orders[i].takerAssetAmount);
          var takerFeeBN = web3.utils.toBN(decoded.orders[i].takerFee);
          var orderInputAmountBN = takerAssetAmountBN.add(takerFeeBN); // Maximum amount we can send to this order including the taker fee

          var makerAssetAmountBN = web3.utils.toBN(decoded.orders[i].makerAssetAmount);

          if (maxMakerAssetFillAmountBN !== undefined) {
            // maxMakerAssetFillAmountBN is specified, so use it
            if (maxMakerAssetFillAmountBN.sub(makerAssetFilledAmountBN).lte(makerAssetAmountBN)) {
              // Calculate orderTakerAssetFillAmountBN and orderInputFillAmountBN from maxMakerAssetFillAmountBN
              var orderMakerAssetFillAmountBN = maxMakerAssetFillAmountBN.sub(makerAssetFilledAmountBN);
              var orderTakerAssetFillAmountBN = orderMakerAssetFillAmountBN.mul(takerAssetAmountBN).div(makerAssetAmountBN);
              var orderInputFillAmountBN = orderMakerAssetFillAmountBN.mul(orderInputAmountBN).div(makerAssetAmountBN);
              console.log(orderMakerAssetFillAmountBN.toString(), orderInputFillAmountBN.toString(), makerAssetAmountBN.mul(orderInputFillAmountBN).div(orderInputAmountBN).toString());
              var tries = 0;

              while (makerAssetAmountBN.mul(orderInputFillAmountBN).div(orderInputAmountBN).lt(orderMakerAssetFillAmountBN)) {
                if (tries >= 1000) return toastr["error"]("Failed to get increment order input amount to achieve desired output amount: " + err, "Withdrawal failed");
                orderInputFillAmountBN.iadd(web3.utils.toBN(1)); // Make sure we have enough input fill amount to achieve this maker asset fill amount

                tries++;
              }

              console.log(orderMakerAssetFillAmountBN.toString(), orderInputFillAmountBN.toString(), makerAssetAmountBN.mul(orderInputFillAmountBN).div(orderInputAmountBN).toString());
            } else {
              // Fill whole order
              var orderMakerAssetFillAmountBN = makerAssetAmountBN;
              var orderTakerAssetFillAmountBN = takerAssetAmountBN;
              var orderInputFillAmountBN = orderInputAmountBN;
            } // If this order input amount is higher than the remaining input, calculate orderTakerAssetFillAmountBN and orderMakerAssetFillAmountBN from the remaining maxInputAmountBN as usual


            if (orderInputFillAmountBN.gt(maxInputAmountBN.sub(inputFilledAmountBN))) {
              orderInputFillAmountBN = maxInputAmountBN.sub(inputFilledAmountBN);
              orderTakerAssetFillAmountBN = orderInputFillAmountBN.mul(takerAssetAmountBN).div(orderInputAmountBN);
              orderMakerAssetFillAmountBN = orderInputFillAmountBN.mul(makerAssetAmountBN).div(orderInputAmountBN);
            }
          } else {
            // maxMakerAssetFillAmountBN is not specified, so use maxInputAmountBN
            if (maxInputAmountBN.sub(inputFilledAmountBN).lte(orderInputAmountBN)) {
              // Calculate orderInputFillAmountBN and orderTakerAssetFillAmountBN from the remaining maxInputAmountBN as usual
              var orderInputFillAmountBN = maxInputAmountBN.sub(inputFilledAmountBN);
              var orderTakerAssetFillAmountBN = orderInputFillAmountBN.mul(takerAssetAmountBN).div(orderInputAmountBN);
              var orderMakerAssetFillAmountBN = orderInputFillAmountBN.mul(makerAssetAmountBN).div(orderInputAmountBN);
            } else {
              // Fill whole order
              var orderInputFillAmountBN = orderInputAmountBN;
              var orderTakerAssetFillAmountBN = takerAssetAmountBN;
              var orderMakerAssetFillAmountBN = makerAssetAmountBN;
            }
          } // Add order to returned array


          orders.push(decoded.orders[i]); // Add order fill amounts to total fill amounts

          inputFilledAmountBN.iadd(orderInputFillAmountBN);
          takerAssetFilledAmountBN.iadd(orderTakerAssetFillAmountBN);
          makerAssetFilledAmountBN.iadd(orderMakerAssetFillAmountBN); // Check if we have hit maxInputAmountBN or maxTakerAssetFillAmountBN

          if (inputFilledAmountBN.gte(maxInputAmountBN) || maxMakerAssetFillAmountBN !== undefined && makerAssetFilledAmountBN.gte(maxMakerAssetFillAmountBN)) break;
        }

        if (takerAssetFilledAmountBN.isZero()) reject("No orders found on 0x swap API");
        resolve([orders, inputFilledAmountBN, decoded.protocolFee, takerAssetFilledAmountBN, makerAssetFilledAmountBN]);
      }).fail(function (err) {
        reject("Error requesting quote from 0x swap API: " + err.message);
      });
    });
  },

  /**
   * Deposit funds to the quant fund.
   */
  handleDeposit: function () {
    var _handleDeposit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(event) {
      var token, amount, amountBN;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              event.preventDefault();
              token = $('#DepositToken').val(); // if (["DAI", "USDC", "USDT", "ETH"].indexOf(token) < 0) return toastr["error"]("Invalid token!", "Deposit failed");

              amount = parseFloat($('#DepositAmount').val());

              if (!(amount <= 0)) {
                _context6.next = 5;
                break;
              }

              return _context6.abrupt("return", toastr["error"]("Amount must be greater than 0!", "Deposit failed"));

            case 5:
              amountBN = web3.utils.toBN(amount * (["DAI", "ETH"].indexOf(token) >= 0 ? 1e18 : 1e6));
              $('#depositButton').prop("disabled", true);
              $('#depositButton').text("...");
              _context6.next = 10;
              return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                var accepted, allowanceBN, acceptedCurrency, _yield$App$get0xSwapO, _yield$App$get0xSwapO2, orders, inputFilledAmountBN, protocolFee, takerAssetFilledAmountBN, makerAssetFilledAmountBN, amountUsd, slippage, slippageAbsPercentageString, signatures, j;

                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        App.getDirectlyDepositableCurrencies();

                        if (!(["DAI", "USDC", "USDT"].indexOf(token) >= 0)) {
                          _context5.next = 7;
                          break;
                        }

                        _context5.next = 4;
                        return App.contracts.RariFundManager.methods.isCurrencyAccepted(token).call();

                      case 4:
                        _context5.t0 = _context5.sent;
                        _context5.next = 8;
                        break;

                      case 7:
                        _context5.t0 = false;

                      case 8:
                        accepted = _context5.t0;

                        if (!accepted) {
                          _context5.next = 36;
                          break;
                        }

                        $('#DepositSlippage').hide();
                        console.log('Deposit ' + amount + ' ' + token + ' directly'); // Approve tokens to RariFundManager

                        _context5.prev = 12;
                        _context5.t1 = web3.utils;
                        _context5.next = 16;
                        return App.contracts[token].methods.allowance(App.selectedAccount, App.contracts.RariFundManager.options.address).call();

                      case 16:
                        _context5.t2 = _context5.sent;
                        allowanceBN = _context5.t1.toBN.call(_context5.t1, _context5.t2);

                        if (!allowanceBN.lt(amountBN)) {
                          _context5.next = 21;
                          break;
                        }

                        _context5.next = 21;
                        return App.contracts[token].methods.approve(App.contracts.RariFundManager.options.address, amountBN).send({
                          from: App.selectedAccount
                        });

                      case 21:
                        _context5.next = 26;
                        break;

                      case 23:
                        _context5.prev = 23;
                        _context5.t3 = _context5["catch"](12);
                        return _context5.abrupt("return", toastr["error"]("Failed to approve tokens to RariFundManager: " + _context5.t3, "Deposit failed"));

                      case 26:
                        _context5.prev = 26;
                        _context5.next = 29;
                        return App.contracts.RariFundManager.methods.deposit(token, amountBN).send({
                          from: App.selectedAccount
                        });

                      case 29:
                        _context5.next = 34;
                        break;

                      case 31:
                        _context5.prev = 31;
                        _context5.t4 = _context5["catch"](26);
                        return _context5.abrupt("return", toastr["error"](_context5.t4.message ? _context5.t4.message : _context5.t4, "Deposit failed"));

                      case 34:
                        _context5.next = 121;
                        break;

                      case 36:
                        // Get accepted currency
                        acceptedCurrency = null;
                        _context5.t5 = token !== "DAI";

                        if (!_context5.t5) {
                          _context5.next = 42;
                          break;
                        }

                        _context5.next = 41;
                        return App.contracts.RariFundManager.methods.isCurrencyAccepted("DAI").call();

                      case 41:
                        _context5.t5 = _context5.sent;

                      case 42:
                        if (!_context5.t5) {
                          _context5.next = 46;
                          break;
                        }

                        acceptedCurrency = "DAI";
                        _context5.next = 62;
                        break;

                      case 46:
                        _context5.t6 = token !== "USDC";

                        if (!_context5.t6) {
                          _context5.next = 51;
                          break;
                        }

                        _context5.next = 50;
                        return App.contracts.RariFundManager.methods.isCurrencyAccepted("USDC").call();

                      case 50:
                        _context5.t6 = _context5.sent;

                      case 51:
                        if (!_context5.t6) {
                          _context5.next = 55;
                          break;
                        }

                        acceptedCurrency = "USDC";
                        _context5.next = 62;
                        break;

                      case 55:
                        _context5.t7 = token !== "USDT";

                        if (!_context5.t7) {
                          _context5.next = 60;
                          break;
                        }

                        _context5.next = 59;
                        return App.contracts.RariFundManager.methods.isCurrencyAccepted("USDT").call();

                      case 59:
                        _context5.t7 = _context5.sent;

                      case 60:
                        if (!_context5.t7) {
                          _context5.next = 62;
                          break;
                        }

                        acceptedCurrency = "USDT";

                      case 62:
                        if (!(acceptedCurrency === null)) {
                          _context5.next = 64;
                          break;
                        }

                        return _context5.abrupt("return", toastr["error"]("No accepted currencies found.", "Deposit failed"));

                      case 64:
                        _context5.prev = 64;
                        _context5.next = 67;
                        return App.get0xSwapOrders(token === "ETH" ? "WETH" : App.contracts[token].options.address, App.contracts[acceptedCurrency].options.address, amountBN);

                      case 67:
                        _yield$App$get0xSwapO = _context5.sent;
                        _yield$App$get0xSwapO2 = _slicedToArray(_yield$App$get0xSwapO, 5);
                        orders = _yield$App$get0xSwapO2[0];
                        inputFilledAmountBN = _yield$App$get0xSwapO2[1];
                        protocolFee = _yield$App$get0xSwapO2[2];
                        takerAssetFilledAmountBN = _yield$App$get0xSwapO2[3];
                        makerAssetFilledAmountBN = _yield$App$get0xSwapO2[4];
                        _context5.next = 79;
                        break;

                      case 76:
                        _context5.prev = 76;
                        _context5.t8 = _context5["catch"](64);
                        return _context5.abrupt("return", toastr["error"]("Failed to get swap orders from 0x API: " + _context5.t8, "Deposit failed"));

                      case 79:
                        if (!inputFilledAmountBN.lt(amountBN)) {
                          _context5.next = 82;
                          break;
                        }

                        $('#DepositAmount').val(inputFilledAmountBN.toString() / (["DAI", "ETH"].indexOf(token) >= 0 ? 1e18 : 1e6));
                        return _context5.abrupt("return", toastr["warning"]("Unable to find enough liquidity to exchange " + token + " before depositing.", "Deposit canceled"));

                      case 82:
                        if (!(token === "ETH")) {
                          _context5.next = 90;
                          break;
                        }

                        _context5.t10 = amount;
                        _context5.next = 86;
                        return App.get0xPrice("ETH", acceptedCurrency);

                      case 86:
                        _context5.t11 = _context5.sent;
                        _context5.t9 = _context5.t10 / _context5.t11;
                        _context5.next = 91;
                        break;

                      case 90:
                        _context5.t9 = amount;

                      case 91:
                        amountUsd = _context5.t9;
                        slippage = 1 - makerAssetFilledAmountBN.toString() / (acceptedCurrency === "DAI" ? 1e18 : 1e6) / amountUsd;
                        slippageAbsPercentageString = Math.abs(slippage * 100).toFixed(3);

                        if ($('#DepositSlippage').is(':visible')) {
                          _context5.next = 97;
                          break;
                        }

                        $('#DepositSlippage').html(slippage >= 0 ? 'Slippage: <kbd class="text-' + (slippageAbsPercentageString === "0.000" ? "info" : "danger") + '">' + slippageAbsPercentageString + '%</kbd>' : 'Bonus: <kbd class="text-success">' + slippageAbsPercentageString + '%</kbd>').show();
                        return _context5.abrupt("return", toastr["warning"]("Please note the exchange slippage required to make a deposit of this currency.", "Deposit canceled"));

                      case 97:
                        if (!($('#DepositSlippage kbd').text() !== slippageAbsPercentageString + "%")) {
                          _context5.next = 100;
                          break;
                        }

                        $('#DepositSlippage').html(slippage >= 0 ? 'Slippage: <kbd class="text-' + (slippageAbsPercentageString === "0.000" ? "info" : "danger") + '">' + slippageAbsPercentageString + '%</kbd>' : 'Bonus: <kbd class="text-success">' + slippageAbsPercentageString + '%</kbd>').show();
                        return _context5.abrupt("return", toastr["warning"]("Exchange slippage changed.", "Deposit canceled"));

                      case 100:
                        console.log('Exchange ' + amount + ' ' + token + ' to deposit ' + acceptedCurrency); // Approve tokens to RariFundProxy if token is not ETH

                        if (!(token !== "ETH")) {
                          _context5.next = 110;
                          break;
                        }

                        _context5.t12 = web3.utils;
                        _context5.next = 105;
                        return App.contracts[token].methods.allowance(App.selectedAccount, App.contracts.RariFundProxy.options.address).call();

                      case 105:
                        _context5.t13 = _context5.sent;
                        allowanceBN = _context5.t12.toBN.call(_context5.t12, _context5.t13);

                        if (!allowanceBN.lt(amountBN)) {
                          _context5.next = 110;
                          break;
                        }

                        _context5.next = 110;
                        return App.contracts[token].methods.approve(App.contracts.RariFundProxy.options.address, amountBN).send({
                          from: App.selectedAccount
                        });

                      case 110:
                        // Build array of orders and signatures
                        signatures = [];

                        for (j = 0; j < orders.length; j++) {
                          signatures[j] = orders[j].signature;
                          orders[j] = {
                            makerAddress: orders[j].makerAddress,
                            takerAddress: orders[j].takerAddress,
                            feeRecipientAddress: orders[j].feeRecipientAddress,
                            senderAddress: orders[j].senderAddress,
                            makerAssetAmount: orders[j].makerAssetAmount,
                            takerAssetAmount: orders[j].takerAssetAmount,
                            makerFee: orders[j].makerFee,
                            takerFee: orders[j].takerFee,
                            expirationTimeSeconds: orders[j].expirationTimeSeconds,
                            salt: orders[j].salt,
                            makerAssetData: orders[j].makerAssetData,
                            takerAssetData: orders[j].takerAssetData,
                            makerFeeAssetData: orders[j].makerFeeAssetData,
                            takerFeeAssetData: orders[j].takerFeeAssetData
                          };
                        } // Exchange and deposit tokens via RariFundProxy


                        _context5.prev = 112;
                        _context5.next = 115;
                        return App.contracts.RariFundProxy.methods.exchangeAndDeposit(token === "ETH" ? "0x0000000000000000000000000000000000000000" : App.contracts[token].options.address, amountBN, acceptedCurrency, orders, signatures, takerAssetFilledAmountBN).send({
                          from: App.selectedAccount,
                          value: token === "ETH" ? web3.utils.toBN(protocolFee).add(amountBN).toString() : protocolFee
                        });

                      case 115:
                        _context5.next = 120;
                        break;

                      case 117:
                        _context5.prev = 117;
                        _context5.t14 = _context5["catch"](112);
                        return _context5.abrupt("return", toastr["error"]("RariFundProxy.exchangeAndDeposit failed: " + _context5.t14, "Deposit failed"));

                      case 120:
                        // Hide old slippage after exchange success
                        $('#DepositSlippage').hide();

                      case 121:
                        // Alert success and refresh balances
                        toastr["success"]("Deposit of " + amount + " " + token + " confirmed!", "Deposit successful");
                        App.getFundBalance();
                        App.getMyFundBalance();
                        App.getTokenBalance();
                        App.getDirectlyWithdrawableCurrencies();

                      case 126:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5, null, [[12, 23], [26, 31], [64, 76], [112, 117]]);
              }))();

            case 10:
              $('#depositButton').text("Deposit");
              $('#depositButton').prop("disabled", false);

            case 12:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    function handleDeposit(_x) {
      return _handleDeposit.apply(this, arguments);
    }

    return handleDeposit;
  }(),

  /**
   * Withdraw funds from the quant fund.
   */
  handleWithdraw: function () {
    var _handleWithdraw = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(event) {
      var token, amount, amountBN;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              event.preventDefault();
              token = $('#WithdrawToken').val(); // if (["DAI", "USDC", "USDT", "ETH"].indexOf(token) < 0) return toastr["error"]("Invalid token!", "Withdrawal failed");

              amount = parseFloat($('#WithdrawAmount').val());

              if (!(amount <= 0)) {
                _context8.next = 5;
                break;
              }

              return _context8.abrupt("return", toastr["error"]("Amount must be greater than 0!", "Withdrawal failed"));

            case 5:
              amountBN = web3.utils.toBN(amount * (["DAI", "ETH"].indexOf(token) >= 0 ? 1e18 : 1e6));
              $('#withdrawButton').prop("disabled", true);
              $('#withdrawButton').text("...");
              _context8.next = 10;
              return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
                var allowanceBN, tokenRawFundBalanceBN, inputCurrencyCodes, inputAmountBNs, allOrders, allSignatures, makerAssetFillAmountBNs, protocolFeeBNs, amountInputtedUsdBN, amountWithdrawnBN, totalProtocolFeeBN, inputCandidates, _i4, _arr3, inputToken, rawFundBalanceBN, i, _yield$App$get0xSwapO3, _yield$App$get0xSwapO4, orders, inputFilledAmountBN, protocolFee, takerAssetFilledAmountBN, makerAssetFilledAmountBN, signatures, j, thisOutputAmountBN, thisInputAmountBN, tries, amountUsd, slippage, slippageAbsPercentageString, inputAmountStrings, makerAssetFillAmountStrings, protocolFeeStrings;

                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        App.getDirectlyWithdrawableCurrencies(); // Approve RFT to RariFundManager

                        _context7.prev = 1;
                        _context7.t0 = web3.utils;
                        _context7.next = 5;
                        return App.contracts.RariFundToken.methods.allowance(App.selectedAccount, App.contracts.RariFundManager.options.address).call();

                      case 5:
                        _context7.t1 = _context7.sent;
                        allowanceBN = _context7.t0.toBN.call(_context7.t0, _context7.t1);

                        if (!allowanceBN.lt(web3.utils.toBN(2).pow(web3.utils.toBN(256)).subn(1))) {
                          _context7.next = 10;
                          break;
                        }

                        _context7.next = 10;
                        return App.contracts.RariFundToken.methods.approve(App.contracts.RariFundManager.options.address, web3.utils.toBN(2).pow(web3.utils.toBN(256)).subn(1)).send({
                          from: App.selectedAccount
                        });

                      case 10:
                        _context7.next = 15;
                        break;

                      case 12:
                        _context7.prev = 12;
                        _context7.t2 = _context7["catch"](1);
                        return _context7.abrupt("return", toastr["error"]("Failed to approve RFT to RariFundManager: " + _context7.t2, "Withdrawal failed"));

                      case 15:
                        // See how much we can withdraw directly if token is not ETH
                        tokenRawFundBalanceBN = web3.utils.toBN(0);

                        if (!(["DAI", "USDC", "USDT"].indexOf(token) >= 0)) {
                          _context7.next = 28;
                          break;
                        }

                        _context7.prev = 17;
                        _context7.t3 = web3.utils;
                        _context7.next = 21;
                        return App.contracts.RariFundManager.methods["getRawFundBalance(string)"](token).call();

                      case 21:
                        _context7.t4 = _context7.sent;
                        tokenRawFundBalanceBN = _context7.t3.toBN.call(_context7.t3, _context7.t4);
                        _context7.next = 28;
                        break;

                      case 25:
                        _context7.prev = 25;
                        _context7.t5 = _context7["catch"](17);
                        return _context7.abrupt("return", toastr["error"]("Failed to get raw fund balance of output currency: " + _context7.t5, "Withdrawal failed"));

                      case 28:
                        if (!tokenRawFundBalanceBN.gte(amountBN)) {
                          _context7.next = 35;
                          break;
                        }

                        // If we can withdraw everything directly, do so
                        $('#WithdrawSlippage').hide();
                        console.log('Withdraw ' + amountBN + ' of ' + amount + ' ' + token + ' directly');
                        _context7.next = 33;
                        return App.contracts.RariFundManager.methods.withdraw(token, amountBN).send({
                          from: App.selectedAccount
                        });

                      case 33:
                        _context7.next = 174;
                        break;

                      case 35:
                        // Otherwise, exchange as few currencies as possible (ideally those with the lowest balances)
                        inputCurrencyCodes = [];
                        inputAmountBNs = [];
                        allOrders = [];
                        allSignatures = [];
                        makerAssetFillAmountBNs = [];
                        protocolFeeBNs = [];
                        amountInputtedUsdBN = web3.utils.toBN(0);
                        amountWithdrawnBN = web3.utils.toBN(0);
                        totalProtocolFeeBN = web3.utils.toBN(0); // Get input candidates

                        inputCandidates = [];
                        _i4 = 0, _arr3 = ["DAI", "USDC", "USDT"];

                      case 46:
                        if (!(_i4 < _arr3.length)) {
                          _context7.next = 68;
                          break;
                        }

                        inputToken = _arr3[_i4];

                        if (!(inputToken === token && tokenRawFundBalanceBN.gt(web3.utils.toBN(0)))) {
                          _context7.next = 59;
                          break;
                        }

                        // Withdraw as much as we can of the output token first
                        inputCurrencyCodes.push(token);
                        inputAmountBNs.push(tokenRawFundBalanceBN);
                        allOrders.push([]);
                        allSignatures.push([]);
                        makerAssetFillAmountBNs.push(0);
                        protocolFeeBNs.push(0);
                        amountInputtedUsdBN.iadd(tokenRawFundBalanceBN.mul(web3.utils.toBN(1e18)).div(web3.utils.toBN(token === "DAI" ? 1e18 : 1e6)));
                        amountWithdrawnBN.iadd(tokenRawFundBalanceBN);
                        _context7.next = 65;
                        break;

                      case 59:
                        _context7.t6 = web3.utils;
                        _context7.next = 62;
                        return App.contracts.RariFundManager.methods["getRawFundBalance(string)"](inputToken).call();

                      case 62:
                        _context7.t7 = _context7.sent;
                        rawFundBalanceBN = _context7.t6.toBN.call(_context7.t6, _context7.t7);
                        if (rawFundBalanceBN.gt(web3.utils.toBN(0))) inputCandidates.push({
                          currencyCode: inputToken,
                          rawFundBalanceBN: rawFundBalanceBN
                        });

                      case 65:
                        _i4++;
                        _context7.next = 46;
                        break;

                      case 68:
                        i = 0;

                      case 69:
                        if (!(i < inputCandidates.length)) {
                          _context7.next = 96;
                          break;
                        }

                        _context7.prev = 70;
                        _context7.next = 73;
                        return App.get0xSwapOrders(App.contracts[inputCandidates[i].currencyCode].options.address, token === "ETH" ? "WETH" : App.contracts[token].options.address, inputCandidates[i].rawFundBalanceBN, amountBN);

                      case 73:
                        _yield$App$get0xSwapO3 = _context7.sent;
                        _yield$App$get0xSwapO4 = _slicedToArray(_yield$App$get0xSwapO3, 5);
                        orders = _yield$App$get0xSwapO4[0];
                        inputFilledAmountBN = _yield$App$get0xSwapO4[1];
                        protocolFee = _yield$App$get0xSwapO4[2];
                        takerAssetFilledAmountBN = _yield$App$get0xSwapO4[3];
                        makerAssetFilledAmountBN = _yield$App$get0xSwapO4[4];
                        _context7.next = 85;
                        break;

                      case 82:
                        _context7.prev = 82;
                        _context7.t8 = _context7["catch"](70);
                        return _context7.abrupt("return", toastr["error"]("Failed to get swap orders from 0x API: " + _context7.t8, "Withdrawal failed"));

                      case 85:
                        // Build array of orders and signatures
                        signatures = [];

                        for (j = 0; j < orders.length; j++) {
                          signatures[j] = orders[j].signature;
                          orders[j] = {
                            makerAddress: orders[j].makerAddress,
                            takerAddress: orders[j].takerAddress,
                            feeRecipientAddress: orders[j].feeRecipientAddress,
                            senderAddress: orders[j].senderAddress,
                            makerAssetAmount: orders[j].makerAssetAmount,
                            takerAssetAmount: orders[j].takerAssetAmount,
                            makerFee: orders[j].makerFee,
                            takerFee: orders[j].takerFee,
                            expirationTimeSeconds: orders[j].expirationTimeSeconds,
                            salt: orders[j].salt,
                            makerAssetData: orders[j].makerAssetData,
                            takerAssetData: orders[j].takerAssetData,
                            makerFeeAssetData: orders[j].makerFeeAssetData,
                            takerFeeAssetData: orders[j].takerFeeAssetData
                          };
                        }

                        inputCandidates[i].orders = orders;
                        inputCandidates[i].signatures = signatures;
                        inputCandidates[i].inputFillAmountBN = inputFilledAmountBN;
                        inputCandidates[i].protocolFee = protocolFee;
                        inputCandidates[i].takerAssetFillAmountBN = takerAssetFilledAmountBN;
                        inputCandidates[i].makerAssetFillAmountBN = makerAssetFilledAmountBN;

                      case 93:
                        i++;
                        _context7.next = 69;
                        break;

                      case 96:
                        // Sort candidates from lowest to highest takerAssetFillAmount
                        inputCandidates.sort(function (a, b) {
                          return a.makerAssetFillAmountBN.gt(b.makerAssetFillAmountBN) ? 1 : -1;
                        });
                        console.log(inputCandidates); // Loop through input currency candidates until we fill the withdrawal

                        i = 0;

                      case 99:
                        if (!(i < inputCandidates.length)) {
                          _context7.next = 129;
                          break;
                        }

                        if (!inputCandidates[i].makerAssetFillAmountBN.gte(amountBN.sub(amountWithdrawnBN))) {
                          _context7.next = 123;
                          break;
                        }

                        thisOutputAmountBN = amountBN.sub(amountWithdrawnBN);
                        thisInputAmountBN = inputCandidates[i].inputFillAmountBN.mul(thisOutputAmountBN).div(inputCandidates[i].makerAssetFillAmountBN);
                        console.log(thisOutputAmountBN.toString(), thisInputAmountBN.toString(), inputCandidates[i].makerAssetFillAmountBN.mul(thisInputAmountBN).div(inputCandidates[i].inputFillAmountBN).toString());
                        tries = 0;

                      case 105:
                        if (!inputCandidates[i].makerAssetFillAmountBN.mul(thisInputAmountBN).div(inputCandidates[i].inputFillAmountBN).lt(thisOutputAmountBN)) {
                          _context7.next = 112;
                          break;
                        }

                        if (!(tries >= 1000)) {
                          _context7.next = 108;
                          break;
                        }

                        return _context7.abrupt("return", toastr["error"]("Failed to get increment order input amount to achieve desired output amount: " + err, "Withdrawal failed"));

                      case 108:
                        thisInputAmountBN.iadd(web3.utils.toBN(1)); // Make sure we have enough input fill amount to achieve this maker asset fill amount

                        tries++;
                        _context7.next = 105;
                        break;

                      case 112:
                        console.log(thisOutputAmountBN.toString(), thisInputAmountBN.toString(), inputCandidates[i].makerAssetFillAmountBN.mul(thisInputAmountBN).div(inputCandidates[i].inputFillAmountBN).toString());
                        inputCurrencyCodes.push(inputCandidates[i].currencyCode);
                        inputAmountBNs.push(thisInputAmountBN);
                        allOrders.push(inputCandidates[i].orders);
                        allSignatures.push(inputCandidates[i].signatures);
                        makerAssetFillAmountBNs.push(thisOutputAmountBN);
                        protocolFeeBNs.push(web3.utils.toBN(inputCandidates[i].protocolFee));
                        amountInputtedUsdBN.iadd(thisInputAmountBN.mul(web3.utils.toBN(1e18)).div(web3.utils.toBN(inputCandidates[i].currencyCode === "DAI" ? 1e18 : 1e6)));
                        amountWithdrawnBN.iadd(thisOutputAmountBN);
                        totalProtocolFeeBN.iadd(web3.utils.toBN(inputCandidates[i].protocolFee));
                        return _context7.abrupt("break", 129);

                      case 123:
                        // Add all that we can of the last one, then go through them again
                        if (i == inputCandidates.length - 1) {
                          inputCurrencyCodes.push(inputCandidates[i].currencyCode);
                          inputAmountBNs.push(inputCandidates[i].inputFillAmountBN);
                          allOrders.push(inputCandidates[i].orders);
                          allSignatures.push(inputCandidates[i].signatures);
                          makerAssetFillAmountBNs.push(inputCandidates[i].makerAssetFillAmountBN);
                          protocolFeeBNs.push(web3.utils.toBN(inputCandidates[i].protocolFee));
                          amountInputtedUsdBN.iadd(inputCandidates[i].inputFillAmountBN.mul(web3.utils.toBN(1e18)).div(web3.utils.toBN(inputCandidates[i].currencyCode === "DAI" ? 1e18 : 1e6)));
                          amountWithdrawnBN.iadd(inputCandidates[i].makerAssetFillAmountBN);
                          totalProtocolFeeBN.iadd(web3.utils.toBN(inputCandidates[i].protocolFee));
                          i = -1;
                          inputCandidates.pop();
                        } // Stop if we have filled the withdrawal


                        if (!amountWithdrawnBN.gte(amountBN)) {
                          _context7.next = 126;
                          break;
                        }

                        return _context7.abrupt("break", 129);

                      case 126:
                        i++;
                        _context7.next = 99;
                        break;

                      case 129:
                        if (!amountWithdrawnBN.lt(amountBN)) {
                          _context7.next = 132;
                          break;
                        }

                        $('#WithdrawAmount').val(amountWithdrawnBN.toString() / (["DAI", "ETH"].indexOf(token) >= 0 ? 1e18 : 1e6));
                        return _context7.abrupt("return", toastr["warning"]("Unable to find enough liquidity to exchange withdrawn tokens to " + token + ".", "Withdrawal canceled"));

                      case 132:
                        if (!(token === "ETH")) {
                          _context7.next = 140;
                          break;
                        }

                        _context7.t10 = amount;
                        _context7.next = 136;
                        return App.get0xPrice("DAI", "WETH");

                      case 136:
                        _context7.t11 = _context7.sent;
                        _context7.t9 = _context7.t10 * _context7.t11;
                        _context7.next = 141;
                        break;

                      case 140:
                        _context7.t9 = amount;

                      case 141:
                        amountUsd = _context7.t9;
                        // TODO: Use actual input currencies instead of using DAI for USD price
                        slippage = 1 - amountUsd / (amountInputtedUsdBN.toString() / 1e18);
                        slippageAbsPercentageString = Math.abs(slippage * 100).toFixed(3);

                        if ($('#WithdrawSlippage').is(':visible')) {
                          _context7.next = 147;
                          break;
                        }

                        $('#WithdrawSlippage').html(slippage >= 0 ? 'Slippage: <kbd class="text-' + (slippageAbsPercentageString === "0.000" ? "info" : "danger") + '">' + slippageAbsPercentageString + '%</kbd>' : 'Bonus: <kbd class="text-success">' + slippageAbsPercentageString + '%</kbd>').show();
                        return _context7.abrupt("return", toastr["warning"]("Please note the exchange slippage required to make a withdrawal of this currency.", "Withdrawal canceled"));

                      case 147:
                        if (!($('#WithdrawSlippage kbd').text() !== slippageAbsPercentageString + "%")) {
                          _context7.next = 150;
                          break;
                        }

                        $('#WithdrawSlippage').html(slippage >= 0 ? 'Slippage: <kbd class="text-' + (slippageAbsPercentageString === "0.000" ? "info" : "danger") + '">' + slippageAbsPercentageString + '%</kbd>' : 'Bonus: <kbd class="text-success">' + slippageAbsPercentageString + '%</kbd>').show();
                        return _context7.abrupt("return", toastr["warning"]("Exchange slippage changed.", "Withdrawal canceled"));

                      case 150:
                        console.log('Withdraw and exchange to ' + amountWithdrawnBN.toString() / (["DAI", "ETH"].indexOf(token) >= 0 ? 1e18 : 1e6) + ' ' + token); // Withdraw and exchange tokens via RariFundProxy

                        _context7.prev = 151;
                        inputAmountStrings = [];

                        for (i = 0; i < inputAmountBNs.length; i++) {
                          inputAmountStrings[i] = inputAmountBNs[i].toString();
                        }

                        makerAssetFillAmountStrings = [];

                        for (i = 0; i < makerAssetFillAmountBNs.length; i++) {
                          makerAssetFillAmountStrings[i] = makerAssetFillAmountBNs[i].toString();
                        }

                        protocolFeeStrings = [];

                        for (i = 0; i < protocolFeeBNs.length; i++) {
                          protocolFeeStrings[i] = protocolFeeBNs[i].toString();
                        }

                        console.log(inputCurrencyCodes, inputAmountStrings, token === "ETH" ? "ETH" : App.contracts[token].options.address, allOrders, allSignatures, makerAssetFillAmountStrings, protocolFeeStrings);
                        _context7.t12 = App.contracts.RariFundProxy.methods.withdrawAndExchange(inputCurrencyCodes, inputAmountStrings, token === "ETH" ? "0x0000000000000000000000000000000000000000" : App.contracts[token].options.address, allOrders, allSignatures, makerAssetFillAmountStrings, protocolFeeStrings);
                        _context7.t13 = App.selectedAccount;
                        _context7.t14 = totalProtocolFeeBN;
                        _context7.next = 164;
                        return web3.eth.getTransactionCount(App.selectedAccount);

                      case 164:
                        _context7.t15 = _context7.sent;
                        _context7.t16 = {
                          from: _context7.t13,
                          value: _context7.t14,
                          nonce: _context7.t15
                        };
                        _context7.next = 168;
                        return _context7.t12.send.call(_context7.t12, _context7.t16);

                      case 168:
                        _context7.next = 173;
                        break;

                      case 170:
                        _context7.prev = 170;
                        _context7.t17 = _context7["catch"](151);
                        return _context7.abrupt("return", toastr["error"]("RariFundProxy.withdrawAndExchange failed: " + _context7.t17, "Withdrawal failed"));

                      case 173:
                        // Hide old slippage after exchange success
                        $('#WithdrawSlippage').hide();

                      case 174:
                        // Alert success and refresh balances
                        toastr["success"]("Withdrawal of " + amount + " " + token + " confirmed!", "Withdrawal successful");
                        App.getFundBalance();
                        App.getMyFundBalance();
                        App.getTokenBalance();
                        App.getDirectlyWithdrawableCurrencies();

                      case 179:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7, null, [[1, 12], [17, 25], [70, 82], [151, 170]]);
              }))();

            case 10:
              $('#withdrawButton').text("Withdraw");
              $('#withdrawButton').prop("disabled", false);

            case 12:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));

    function handleWithdraw(_x2) {
      return _handleWithdraw.apply(this, arguments);
    }

    return handleWithdraw;
  }(),

  /**
   * Get the total balance of the quant fund in USD.
   */
  getFundBalance: function getFundBalance() {
    console.log('Getting fund balance...');
    App.contracts.RariFundManager.methods.getFundBalance().call().then(function (result) {
      balance = result / 1e18;
      $('#USDBalance').text(balance);
    }).catch(function (err) {
      console.error(err);
    });
  },

  /**
   * Get the user's account balance in the quant fund in USD.
   */
  getMyFundBalance: function getMyFundBalance() {
    console.log('Getting my fund balance...');
    App.contracts.RariFundManager.methods.balanceOf(App.selectedAccount).call().then(function (result) {
      balance = result / 1e18;
      $('#MyUSDBalance').text(balance);
    }).catch(function (err) {
      console.error(err);
    });
  },

  /**
   * Transfer RariFundToken.
   */
  handleTransfer: function () {
    var _handleTransfer = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(event) {
      var amount, toAddress;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              event.preventDefault();
              amount = parseFloat($('#RFTTransferAmount').val());

              if (!(amount <= 0)) {
                _context10.next = 4;
                break;
              }

              return _context10.abrupt("return", toastr["error"]("Amount must be greater than 0!", "Transfer failed"));

            case 4:
              toAddress = $('#RFTTransferAddress').val();
              $('#transferButton').prop("disabled", true);
              $('#transferButton').text("...");
              _context10.next = 9;
              return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        console.log('Transfer ' + amount + ' RFT to ' + toAddress);
                        _context9.prev = 1;
                        _context9.next = 4;
                        return App.contracts.RariFundToken.methods.transfer(toAddress, web3.utils.toBN(amount * 1e18)).send({
                          from: App.selectedAccount
                        });

                      case 4:
                        _context9.next = 9;
                        break;

                      case 6:
                        _context9.prev = 6;
                        _context9.t0 = _context9["catch"](1);
                        return _context9.abrupt("return", toastr["error"](_context9.t0, "Transfer failed"));

                      case 9:
                        toastr["success"]("Transfer of " + amount + " RFT confirmed!", "Transfer successful");
                        App.getTokenBalance();

                      case 11:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, _callee9, null, [[1, 6]]);
              }))();

            case 9:
              $('#transferButton').text("Transfer");
              $('#transferButton').prop("disabled", false);

            case 11:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10);
    }));

    function handleTransfer(_x3) {
      return _handleTransfer.apply(this, arguments);
    }

    return handleTransfer;
  }(),

  /**
   * Get's the user's balance of RariFundToken.
   */
  getTokenBalance: function getTokenBalance() {
    console.log('Getting token balance...');
    App.contracts.RariFundToken.methods.balanceOf(App.selectedAccount).call().then(function (result) {
      balance = result / 1e18;
      $('#RFTBalance').text(balance);
    }).catch(function (err) {
      console.error(err);
    });
  }
};
$(function () {
  $(document).ready(function () {
    App.init();
  });
});
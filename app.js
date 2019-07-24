// Budget controller
var budgetController = (function() {
    
    var Expense = function(id, desciption, value) {
        this.id = id;
        this.desciption = desciption;
        this.value = value;
        this.percentage = -1; 
    };
    
    Expense.prototype.calculatePercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    var Income = function(id, desciption, value) {
        this.id = id;
        this.desciption = desciption;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // calculate new id
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // create new exp or inc item
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // add item in array
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var item;
            
            data.allItems[type] = data.allItems[type].filter(function(curr) {
                return curr.id === id ? false : true;
            });
            
            /* lecturer method , 
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexof(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            */
            
            //map(function(current) {});
        },
        
        calculateBudget: function() {
            
            // calculate total inome and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function() {
            /*
            a = 20
            b = 10
            c = 40
            income  = 100
            */
            data.allItems.exp.forEach(function(current) {
                current.calculatePercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
        },
        
        getBudget: function() {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              perc: data.percentage
          }
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();


// UI Controller
var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expencesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(number, type) {
        var numSplit, int, decimal, sign;
        /*
        + or - 
        decimal point and 2 numbers after that 1.20
        1,200.00 use comma
        */

        number = Math.abs(number);
        number = number.toFixed(2);

        numSplit = number.split('.');
        int = numSplit[0];
        decimal = numSplit[1];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) +','+ int.substr(int.length - 3);
        }

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + decimal;
    };
    
    return {
        getInput: function() {
            return {
                // possible values for type are inc (income) and exp (expense)
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            // create HTML string with placeholder text
            
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                element = DOMStrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the paceholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desciption);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorId) {
            var element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            fields.forEach(function(current) {
                current.value = '';
            });
            
            fields[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.perc > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.perc + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMStrings.expencesPercLabel);
            var i = 0;
            fields.forEach(function(current) {
                if(percentages[i] > 0) {
                    current.textContent = percentages[i++] +'%';
                } else {
                    current.textContent = '--';
                }
                
            });
            
        },
        
        displyMonth: function() {
            var now, year, month, displayMonths;
            
            displayMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            
            var now = new Date();
            year = now.getFullYear();
            month = now.getMonth(); document.querySelector(DOMStrings.dateLabel).textContent = displayMonths[month] +' '+ year;
        },
        
        changeType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ', ' +
                DOMStrings.inputDescription + ', ' +
                DOMStrings.inputValue
            );
            
            fields.forEach(function(current) {
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    };
    
})();


// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };
    
    var updateBudget = function() {
        // 1. Calculate budget
        budgetCtrl.calculateBudget();
        
        // 2. return budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. read them from budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. update UI with new values
        UICtrl.displayPercentages(percentages);
        
        
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. get input data
        input = UICtrl.getInput();
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear fields
            UICtrl.clearFields();

            // 5. update budget
            updateBudget();
            
            // 6. calculate and update percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, id;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId) {
            // inc-1, exp-1
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseFloat(splitId[1]);
            
            // 1. delete item from data structure
            budgetCtrl.deleteItem(type, id);
            
            // 2. delete from UI   
            UICtrl.deleteListItem(itemId);
            
            // 3. update and show budget
            updateBudget();
            
            // 4. calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displyMonth();
            UICtrl.displayBudget({
              budget: 0,
              totalInc: 0,
              totalExp: 0,
              perc: -1
          });
            setupEventListners();
        }
    }
})(budgetController, UIController);

controller.init();






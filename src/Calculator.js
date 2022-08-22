import { Component } from "react";
import './Calculator.css'

const buttons = [
    { id: "equals", value: "=", display: "=" },
    { id: "zero", value: 0, display: 0 },
    { id: "one", value: 1, display: 1 },
    { id: "two", value: 2, display: 2 },
    { id: "three", value: 3, display: 3 },
    { id: "four", value: 4, display: 4 },
    { id: "five", value: 5, display: 5 },
    { id: "six", value: 6, display: 6 },
    { id: "seven", value: 7, display: 7 },
    { id: "eight", value: 8, display: 8 },
    { id: "nine", value: 9, display: 9 },
    { id: "add", value: "+", display: "+" },
    { id: "subtract", value: "-", display: "-" },
    { id: "multiply", value: "*", display: "×" },
    { id: "divide", value: "/", display: "÷" },
    { id: "decimal", value: ".", display: "." },
    { id: "clear", value: "clear", display: "AC" }
  ];
  
  //used to keep track of operation being computed
  let operationCopy = [];
  //boolean used to check duplicate +/x/÷ cannot be entered consequatively
  let validKey = false;
  //used to limit number of consecutive (-) input to two, which results in a positive ("-(-#) -> +")
  let subtractCount = 0;
  //used to keep track of recent inputs by user
  let displayVal = "";
  //used to reset recent input by user if +/x/÷/- is entered
  let clearDV = false;

export default class Calculator extends Component {
    constructor(props) {
      super(props);
      this.state = {
        result: null,
        last: 0,
        operation: ""
      };
      //allow methods to access component state
      this.operation = this.operation.bind(this);
      this.checkValue = this.checkValue.bind(this);
      this.disableOperations = this.disableOperations.bind(this);
      this.enableOperations = this.enableOperations.bind(this);
    }
    //function to disable operation inputs
      disableOperations(){
        document.getElementById("multiply").disabled = true;
        document.getElementById("add").disabled = true;
        document.getElementById("subtract").disabled = true;
        document.getElementById("divide").disabled = true;
      }
    //function to enable operation inputs
      enableOperations(){
        document.getElementById("multiply").disabled = false;
        document.getElementById("add").disabled = false;
        document.getElementById("subtract").disabled = false;
        document.getElementById("divide").disabled = false;
      }; 
    //forces user to input number first upon initial DOM load
    componentDidMount(){
      this.disableOperations();
      document.getElementById("equals").disabled = true;
    }

    //function to screen various inputs
    checkValue(key) {
      if (key === "+" || key === "/" || key === "*") {
         //Only allow +, /, * to be pushed to computation if operation is not being repeated consequatively or not followed by --
        if (!validKey && subtractCount !== 2) {
          validKey = true;
          operationCopy.push(key);
          subtractCount = 1;
        } 
        //if +, /, * is entered after two consequative - operations (--), replace it and reset subtractCount
        else if(subtractCount === 2){
          operationCopy.pop();
          operationCopy.pop();
          operationCopy.push(key);
          subtractCount = 1;
          validKey = true;
          document.getElementById("subtract").disabled = false;
        }
        //prevent user from repeating +, /, * operation 
        else {
          operationCopy.pop();
          operationCopy.push(key);
        }
        //Allow user to enter decimal values after operation input but prohibit them from executing computation when last input is an operation ex: 23+4- is not allowed.
        document.getElementById("decimal").disabled = false;
        document.getElementById("equals").disabled = true;
        //reset input that is being shown on screen to operation input
        displayVal = key;
        clearDV = true;
      } 
      else if (key === "-") {
        //limit consequative (-) input to be two (-- -> "positive")
        if (subtractCount < 2) {
          subtractCount++;
          operationCopy.push(key);
          //allow user to enter decimal input after minus operation 
          document.getElementById("decimal").disabled = false;
          //prohibit +,/,* input after minus operation but allow - input
          this.disableOperations();
          document.getElementById("subtract").disabled = false;
          if(subtractCount === 2){
            //if consequative -- entered, allow +, /, * inputs...will trigger a replace (see if case for +, /, * code above)
            this.enableOperations();
            document.getElementById("subtract").disabled = true;
            document.getElementById("equals").disabled = true;
          }
          //display - input on screen
          displayVal = key;
          clearDV = true;
        } 
      } 
      else if (key === "."){
         //prohibt duplicate (.) input and executing computation when (.) is the last input ex. 420/69. -> not allowed
         operationCopy.push(key);
         document.getElementById("decimal").disabled = true;
         document.getElementById("equals").disabled = true;
         //ensure number must follow (.) input by disabling operation inputs
         this.disableOperations();
        //add (.) to latest user input being displayed
         displayVal += key;
        }
      else { 
        //screen number inputs
        //If previous input displayed was an operation, clear it and display current number input, add input to computation
        if(clearDV === true){
          clearDV = false;
          displayVal = "";
          displayVal += key;
          operationCopy.push(key);
        } else { //if previous input displayed was number or decimal
          /*prohibit repeating zeros if first element in current number input is a zero and not followed by a decimal,
          ex: prohibit 0000005 but allow 0.5003 and 5001*/
          if(displayVal.toString().charAt(0) === '0' && displayVal.toString().charAt(1) !== '.'){
            displayVal = key;
            operationCopy.pop();
            operationCopy.push(key);
          } else{ 
            // allow consequative valid number inputs to display at once
            displayVal += key;
            operationCopy.push(key);
          }
        }
        //reset subtractCount, allow for operation input and for computation following each number input
        subtractCount = 0;
        validKey = false;
        document.getElementById("equals").disabled = false;
        this.enableOperations();
      }
    }
  
    operation(event) {
      //function executes upon each button click
      let symbol = event.target.value;
      //clear all data when calculator is reset, and switch to default app settings
      if (symbol === "clear") {
        operationCopy = [];
        validKey = false;
        subtractCount = 0;
        displayVal = 0;
        this.setState({
          result: null,
          last: 0,
          operation: ""
        });
        document.getElementById("decimal").disabled = false;
        this.disableOperations();
        document.getElementById("equals").disabled = true;
        document.getElementById("subtract").disabled = false;
        
      } else if (symbol === "=") {
        //convert operation into a string and replace any repeating (-) operations with a (+)
        let equation = operationCopy.join("").replace("--", "+");
        //evaluate complete expression
        let ans = parseFloat(eval(equation).toFixed(4));
        //set display to output the result
        displayVal = ans;
        //all for decimal and operation inputs
        document.getElementById("decimal").disabled = false;
        this.enableOperations();
        //update state to record result and display result and operation on screen
        this.setState({
        result: ans,
        last : displayVal,
        operation: equation
        })
        //reset current operation to only hold result (ex 4 + 7 = 11, so after execution 11 will be stored in next operation)
        operationCopy = [ans];
      } else {
        //screen other inputs and update state
        this.checkValue(symbol);
        this.setState({
        result: this.state.result,
        last: displayVal,
        operation: operationCopy.join("")
      });
      }
    }
  
    render() {
      return (
        <div id="calculator-body">
          {/*Pass state information to display on calculator screen */}
          <Display answer={this.state.last} operation={this.state.operation}/>
          {/*dynamically create a button for all calculator inputs defined in buttons array */}
          <div id="calc-keys">
            {buttons.map((value) => {
              return (
                <Button
                  numberId={value.id}
                  function={this.operation}
                  numberVal={value.value}
                  numberDisplay={value.display}
                />
              );
            })}
          </div>
          <div id="credit">
            by{" "}
            <a target="_blank" href="https://github.com/kireshanth">
              Kireshanth 👨🏿‍💻
            </a>
          </div>
        </div>
      );
    }
  }
  //create child component for a calculator button
  const Button = (props) => {
    return (
      <button
        type="button"
        id={props.numberId}
        onClick={props.function}
        value={props.numberVal}
      >
        {props.numberDisplay}
      </button>
    );
  };
  
  //create child component for the calculator display
  const Display = (props) => {
    return (
      <div id="screen">
        <input type="text" id="operation" value={props.operation} disabled />
        <input type="text" id="display" value={props.answer} disabled />
      </div>
    );
  };
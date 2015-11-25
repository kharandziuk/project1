/** In this file, we create a React component which incorporates components provided by material-ui */

const React = require('react');
const RaisedButton = require('material-ui/lib/raised-button');
const Dialog = require('material-ui/lib/dialog');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const Colors = require('material-ui/lib/styles/colors');
const UI = require('material-ui')


class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
    };
    this._handleTouchTap = this._handleTouchTap.bind(this)
  }

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    }
  }

  componentWillMount() {
    let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
      accent1Color: Colors.deepOrange500
    });

    this.setState({muiTheme: newMuiTheme});
  }

  render() {
    let containerStyle = {
      textAlign: 'center',
      paddingTop: '200px'
    };

    let standardActions = [
      { text: 'Okay' }
    ];
    let onLogin = ()=>{
      let {bus} = this.props
      let {login, password} = this.refs
      bus('login', login.getValue(), password.getValue())
    }
    return (
      <div style={containerStyle}>
        <h1>{this.props.location.state.foo}</h1>
        <h2>Reactor Film</h2>
        <UI.TextField
          ref='login'
          hintText="Login"
          floatingLabelText="Floating Label Text" />
        <UI.TextField
          hintText="Password"
          ref='password'
          floatingLabelText="Password"
          type="password" />
        <UI.FlatButton label="Login" primary={true} onClick={onLogin}/>
      </div>
    );
  }
  _handleTouchTap() {
    this.props.bus('fuck you!')
  }

}
Main.childContextTypes = {
  muiTheme: React.PropTypes.object
}

module.exports = Main;

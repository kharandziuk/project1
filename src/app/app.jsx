(function () {
  let React = require('react')
  let ReactDOM = require('react-dom')

  const $ = require('jquery')
  const _ = require('underscore')
  const UI = require('material-ui')
  const Dropzone = require('react-dropzone')
  const ID = '_id'
  let {EventEmitter} = require('events')

  var getUrl = (endpoint) => `http://localhost:8000/${endpoint}/`

  var xJSON = function(method, url, data, callback) {
      return $.ajax({
      headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
      },
      'type': method,
      'url': url,
      'data': JSON.stringify(data),
      'dataType': 'json',
      'success': callback
      });
  };


  class DataModel extends EventEmitter {
    constructor () {
      super()
      this.state = {}
      $.get('http://localhost:8000/pretendents/').then((data)=> {
        let users = data.reduce(
          (acc, next) => {
            acc[next[ID]] = next
            return acc
          },
          {}
        )
        this.state.users = users;
        this.addUser = this.addUser.bind(this)
        this.changeUser = this.changeUser.bind(this)
        this.emit('change')
      })
    }

    getState() {
      return this.state
    }

    changeUser(propertyName, id, value) {
      this.state.users[id][propertyName] = value
      xJSON(
          'PUT',
          getUrl('pretendents'),
          this.state.users[id]
      ).done((resp)=> console.log(resp))
      .fail((resp)=> { console.log(resp) })
      this.emit('change')
    }

    addImage(id, file) {
      var fd = new FormData()
      fd.append('person', id)
      fd.append('file', file)
      var reader = new FileReader()
      $.ajax({
          url: 'http://localhost:8001/files/',
          data: fd,
          cache: false,
          processData: false,
          contentType: false,
          type: 'POST'
      }).done(()=>{
        reader.readAsDataURL(file)
        reader.onload = (e)=>
          this.state.users[id].attachments.push({
            src: e.target.result
          })
          this.emit('change')
      })
      .fail(()=>{
        this.state.text = 'uploading failed'
        this.emit('change')
      })
    }
    addUser() {
      xJSON(
          'POST',
          getUrl('pretendents'),
          {firstName: '', lastName: ''}
        ).then((newUser)=> {
          this.state.users[newUser[ID]] = _(newUser).extend({attachments:[]})
          this.emit('change')
      })
    }
  }



  class CardHeader extends React.Component {
    onDrop (files) {
      let {storage, user} = this.props
      _(files).forEach(function(f) {
        storage.addImage(user[ID], f)
      })
    }
    render() {
      let {user} = this.props
      let {changeUser} = this.props.storage

      return (
        <div className="row">
          <div className="col-md-3">
            <div className="row center-md">
            <Dropzone ref="dropzone" onDrop={this.onDrop.bind(this)} style={{
              borderWidth: '2px',
              borderColor: 'black',
              borderStyle: 'dashed',
              borderRadius: '4px',
              margin: '30px',
              padding: '15px',
              width: '150px',
              transition: 'all 0.5s',
            }}>
              <div>drop</div>
            </Dropzone>
            </div>
          </div>
          <div className="col-md-8">
            <div className="row left-md">
              <UI.TextField
                value={user.lastName}
                onChange={(e, v) => changeUser('lastName', user[ID], e.target.value)} hintText="Last name" /> 
              <UI.TextField
                value={user.firstName}
                onChange={e => changeUser('firstName', user[ID], e.target.value)} hintText="First name" />
            </div>
          </div>
          <div className="col-md-1">
            <UI.FontIcon className="material-icons">keyboard_arrow_up</UI.FontIcon>
          </div>
        </div>
      )
    }
  }
  class Card extends React.Component {
    render() {
      let {storage, user} = this.props
      console.log('user', user)
      return (
        <div className="row" style={{
          padding: "1rem",
          margin: "2rem",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.24)"}}>
          <CardHeader user={user} storage={storage}/>
          <PhotoGrid photos={user.attachments}></PhotoGrid>
        </div>
      )
    }
  }

  class PhotoGrid extends React.Component {
    render() {
      let {photos} = this.props
      let groupedPhotos = _(photos).reduce(
          (acc, next) => {
            let last = _.last(acc)
            if (_.isUndefined(last) || last.length >= 4) {
              last = []
              acc.push(last)
            }
            last.push(next)
            return acc
          },
          []
      )
      console.log(photos, groupedPhotos)
      return (
        <div className="box" style={{padding: '0.5rem'}}>
          {
            groupedPhotos.map((group, i) => {
              return <div className="row" style={{padding: '0.5rem'}} key={i}>
                {
                  group.map((el, j) => {
                    return (
                      <div className="col-md-3">
                        <img src={el.src} key={[i,j].join('.')} witdh="100" height="100"/>
                      </div>
                    )
                  })
                }
              </div>
            })
          }
        </div>
      )
    }

  }

  class PlusButton extends React.Component {
    constructor(props) {
      super(props)
    }
    render() {
      let {onClick} = this.props
      return (
          <div style={{textAlign: "center", margin: "2rem"}}>
            <UI.FloatingActionButton onClick={onClick}>
              <UI.FontIcon className="material-icons">add</UI.FontIcon>
            </UI.FloatingActionButton>
          </div>
      )
    }
  }
  class CardList extends React.Component {
    constructor(props) {
      super(props)
    }
    render() {
      let {users} = this.props
      return (
          <div>
          {
            _(users).chain().values().map((user)=> {
              return <Card key={user[ID]} user={user} storage={storage}/>
            }).value()
          }
          </div>
      )
    }
  }

  class App extends React.Component {
    constructor(props) {
      super(props)
    }

    render() {
      let {storage} = this.props
      let appState = storage.getState()
      return (
          <div className="row">
            <div className="col-md-6 col-md-offset-3">
              <div className="box">
                <CardList users={appState.users} storage={storage}></CardList>
                <PlusButton onClick={storage.addUser}></PlusButton>
              </div>
            </div>
          </div>
      )
    }
  }
  var storage = new DataModel()
  storage.addListener('change', function() {
    ReactDOM.render(
      <App storage={storage}/>, document.getElementById('app')
    )
  })

})();

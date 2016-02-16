(function () {
  let React = require('react')
  let ReactDOM = require('react-dom')
  const stream = require('stream')

  const $ = require('jquery')
  const _ = require('underscore')
  const H = require('highland')
  const UI = require('material-ui')
  const Dropzone = require('react-dropzone')
  const rx = require('rx')
  const ID = 'id'
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
      this.updatePretendents.call(this)
      this.updateAttachments.call(this)

      this.addUser = this.addUser.bind(this)
      this.changeUser = this.changeUser.bind(this)
    }

    updatePretendents () {
      $.get(getUrl('pretendents')).then(({results})=> {
        let users = results.reduce(
          (acc, next) => {
            acc[next[ID]] = next
            return acc
          },
          {}
        )
        this.state.users = users;
        this.emit('change')
      })
    }

    updateAttachments() {
      $.get(getUrl('attachments')).then(({results})=> {
        this.getState().users.map((u) => {
          u.attachments = results.filter((item) => {
            return item.pretendentId == u.id
          })
        })
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
      fd.append('pretendentId', id)
      fd.append('file', file)
      console.log('bbb', id, file)
      var reader = new FileReader()
      $.ajax({
          url: getUrl('attachments'),
          data: fd,
          cache: false,
          processData: false,
          contentType: false,
          type: 'POST'
      }).done(()=>{
        reader.readAsDataURL(file)
        reader.onload = (e)=>
          console.log('kapa', e.target)
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
      let {user} = this.props
      //_(files).forEach(function(f) {
      //  storage.addImage(user[ID], f)
      //})
    }
    render() {
      let {user} = this.props
      //let {changeUser} = this.props.storage

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
      return (
        <div className="row" style={{
          padding: "1rem",
          margin: "2rem",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.24)"}}>
          <CardHeader user={user}/>
          <PhotoGrid photos={user.photos}></PhotoGrid>
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
              console.log(last)
              acc.push(last)
            }
            last.push(next)
            return acc
          },
          []
      )
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
      console.log(users)
      return (
          <div>
          {
            _(users).chain().values().map((user)=> {
              console.log('u')
              return <Card key={user[ID]} user={user} />
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
      let {state} = this.props
      return (
          <div className="row">
            <div className="col-md-6 col-md-offset-3">
              <div className="box">
                <CardList users={state}/>
              </div>
            </div>
          </div>
      )
    }
  }
  var dal = {
    photos: _.flatten(
      _.range(4).map((i)=> 
        _.range(3).map((j)=> {
          return {
            id: i * 10 + j,
            userId: i,
            src: `http://lorempixel.com/400/200/people/${j}/`}
          }
        )
      )
    ),
    users: [
      ['Max', 'Kharandziuk'],
      ['Arthur', 'Bachinskiy'],
      ['Roman', 'Gaponov'],
      ['Natalia', 'Peter'],
    ].map(([firstName, lastName], id) => {return {id, firstName, lastName}})
  }

    .map(() => {
      users = users.map((u) =>
          _.extend(
            u,
            {
              photos: _.range(3).map((i)=> {return {src: `http://lorempixel.com/400/200/people/${i}/`}})
            }

          )
      )
      return users
    })
    .do(
      (state)=>
        ReactDOM.render(
          <App state={state}/>, document.getElementById('app')
        )
    ).subscribe()

})();

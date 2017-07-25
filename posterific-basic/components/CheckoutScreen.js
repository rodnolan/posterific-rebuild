import React, { Component } from 'react';
import { Image, View, StyleSheet, Text, ToastAndroid, Dimensions } from 'react-native';
import { Container, Content, Header, Left, Button, Icon, Body, Title } from 'native-base';
import PosterModel from '../Model/PosterModel';
import AccountKit, {LoginButton} from 'react-native-facebook-account-kit';
import NativeBaseAccountKitLoginButton from './NativeBaseAccountKitLoginButton';

let { height, width } = Dimensions.get("window");


export default class CheckoutScreen extends React.Component {

  static propTypes = {
    poster: React.PropTypes.instanceOf(PosterModel).isRequired,
  };

  static defaultProps = {
    poster: null,
    authToken: null,
    loggedAccount: null
  };

  constructor(props) {
    super(props);
    this.state = {
      poster: this.props.poster,
    };
  }

  componentWillMount() {
    AccountKit.configure({
      countryWhitelist: ["ID", "US", "CA"],
      defaultCountry: "CA"
    });

    AccountKit.getCurrentAccessToken()
      .then((token) => {
        if (token) {
          AccountKit.getCurrentAccount()
            .then((account) => {
              this.setState({
                authToken: token,
                loggedAccount: account
              });
              this.logUserPurchase();
            })
        } else {
          console.log('No account logged in')
        }
      })
      .catch((e) => console.log('Access token request failed', e))
  }

  render() {
    return (
      <Image
        resizeMode="cover"
        source={require('./../assets/images/login-splash-bg.jpg')}
        style={styles.splashContainer}
      >
        <Container>
          <Header style={{ backgroundColor: '#3770CC' }}>
            <Left>
              <Button transparent onPress={
                () => {
                  this.props.navigator.pop()
                }
              }>
                <Icon name='md-arrow-round-back' />
              </Button>
            </Left>
            <Body>
              <Title style={{ fontSize: 15 }}>Checkout</Title>
            </Body>
          </Header>
          <Content contentContainerStyle={styles.contentContainer}>
            <View style={styles.imageTextWrapper}>
              <View style={styles.congratsWrapper}>
                <Text style={[styles.congrats]}>Thank You!</Text>
              </View>
              <View style={styles.imgWrapper}>
                <Image
                  resizeMode="contain"
                  style={styles.img}
                  source={{ uri: this.state.poster.thumbnailUri }}
                />
              </View>
            </View>
            
            {this.state.loggedAccount ? this.renderUserDetails() : this.renderLoginUI()}

          </Content>
        </Container>
      </Image>
    )
  }

  renderLoginUI() {
    return (
      <View>
        <Button
          info
          iconRight
          block
          rounded
          style={{ margin: 10 }}
          onPress={() => {
            this.loginWithEmail();
          }}
        >
          <Text style={[styles.btnText]}>Login with Email</Text>
          <Icon name="md-mail" />
        </Button>
        <NativeBaseAccountKitLoginButton
          style={{ margin: 10 }}
          type="phone"
          onLogin={(token) => this.onLoginSuccess(token)}
          onError={(e) => this.onLoginError(e)}
        >
          <Text style={styles.btnText}>Login with SMS</Text>
          <Icon name="md-phone-portrait" />
        </NativeBaseAccountKitLoginButton>
      </View>
    );
  }

  renderUserDetails() {
    const { id, email, phoneNumber } = this.state.loggedAccount;
    return (
      <View>
        <Text style={styles.akUser}>Account Kit User: {id} {email} { phoneNumber ?  `${phoneNumber.countryCode} ${phoneNumber.number}` : null }</Text>
        <Button
          info
          iconRight
          block
          rounded
          style={{ margin: 10 }}
          onPress={() => {
            this.logout();
          }}
        >
          <Text style={[styles.btnText]}>Logout</Text>
        </Button>
      </View>
    );
  }

  logout() {
    AccountKit.logout()
      .then(() => {
        this.setState({
          authToken: null,
          loggedAccount: null
        })
      })
      .catch((e) => console.log('logout failed'))
  }

  loginWithEmail() {
    AccountKit.loginWithEmail()
      .then((token) => {
        this.onLoginSuccess(token)
      })
      .catch((e) => {
        this.onLoginError(e)
      })
  }

  onLoginSuccess(token) {
    if (!token) {
      console.warn('User canceled login')
      this.setState({})
    } else {
      AccountKit.getCurrentAccount()
        .then(
        (account) => {
          this.setState({
            authToken: token,
            loggedAccount: account
          })
          this.logUserPurchase();
        })
    }
  }
  onLoginError(e) {
    console.log('Failed to login', e)
  }
  
  logUserPurchase() {
    // assume that the "transaction" succeeded and the purchase was made
    ToastAndroid.showWithGravity("Your purchase was successful", ToastAndroid.LONG, ToastAndroid.CENTER);
  }
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    flexDirection: 'column',
    height: height,
    width: width,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    padding: 10,
  },

  congratsWrapper: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  congrats: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  imgWrapper: {
    flex: 1,
    alignItems: 'center'
  },
  img: {
    width: 300,
    height: 300,
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  akUser: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    margin: 10,
    color: '#FFF'
  },
  
});

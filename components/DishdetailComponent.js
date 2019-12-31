import React, { Component } from 'react';
import { View, Text, ScrollView, FlatList, Button, Modal, StyleSheet, Alert, PanResponder } from 'react-native';
import { Card, Icon, Input, Rating } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite } from '../redux/ActionCreators';
import { postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))

})

function RenderDish(props) {
    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeComment = ({ moveX, moveY, dx, dy }) => {
        if (dy < 200)  
            return true; 
        else
            return false;
    };

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if (dx < -200)
            return true;
        else
            return false;
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
            this.view.rubberBand(1000)
                .then(endState => console.log(endState.finished ? 'finished' : 'cancelled' ));
        },
        onPanResponderEnd: (e, gestureState) => {
            if (recognizeDrag(gestureState)) {
                Alert.alert(
                    'Add to Favorites?',
                    'Are you sure you wish to add ' + dish.name + ' to your favorites?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel'

                        },
                        {
                            text: 'OK',
                            onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}
                        },
                    ],
                    {Cancelable: false}
                )
            return true; 
        }
        else if (recognizeComment(gestureState)) {            
            {window.openModal.toggleModal()}
        }
        }
    });

    if(dish != null) {
        return(
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
            ref={this.handleViewRef}
                {...panResponder.panHandlers} >
            <Card
                featuredTitle={dish.name}
                image={{ uri: baseUrl + dish.image }}
                >
                <Text style={{margin: 10}}>
                   {dish.description} 
                </Text>
                <View style={styles.formRow}>
                    <Icon
                        raised
                        reverse
                        name={ props.favorite ? 'heart' : 'heart-o'}
                        type='font-awesome'
                        color='#f50'
                        onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                        />
                    <Icon
                        raised
                        reverse
                        name='pencil'
                        type='font-awesome'
                        color='#512DA8'
                        onPress={() => window.openModal.toggleModal()}
                        />
                </View>
            </Card>
            </Animatable.View> 
        );
    }
    else {
        return(<View></View>)
    }
}

function RenderComments(props) {
    const comments = props.comments;

    const renderCommentItem = ({ item, index}) => {
        return(
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating style={{ paddingVertical: 10, alignItems: 'left'}}  imageSize={10} startingValue={item.rating} readonly='true'/>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date}</Text>
            </View>
        );
    }

    return(
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
        <Card title="Comments">
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
        </Card>
        </Animatable.View>
    );
}

class Dishdetail extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false
        }
        window.openModal = this;
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleComment() {
        console.log(JSON.stringify(this.state));
        const dishId = this.props.navigation.getParam('dishId', '');
        this.props.postComment(dishId, this.state.rating, this.state.author, this.state.comment);
        this.toggleModal();
    }

    newCommentRating = (rating) => {
        this.setState({rating: rating});
    }

    newCommentAuthor(author) {
        this.setState({author: author});
    }

    newComment(comment) {
        this.setState({comment: comment});
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    render() {
        const dishId = this.props.navigation.getParam('dishId','');

        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                     />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />

                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onRequestClose = {() => this.toggleModal() }>
                    <View style={styles.formRowModal}>
                        <Rating
                            showRating
                            onFinishRating={this.newCommentRating}
                            startingValue="5"
                        />                    
                    </View>
                    <View>
                        <Input placeholder='Author' 
                            leftIcon={{ type: 'font-awesome', name: 'user-o' }} 
                            onChangeText={(author) => this.newCommentAuthor(author)}/>
                    </View>
                    <View>
                        <Input placeholder='Comment' 
                        leftIcon={{ type: 'font-awesome', name: 'comment-o' }} 
                        onChangeText={(comment) => this.newComment(comment)}/>
                    </View>
                    <Button 
                        onPress = {() =>{this.handleComment(); }}
                        color="#512DA8"
                        title="Submit" 
                        />
                    <Button 
                        onPress = {() =>{this.toggleModal(); }}
                        color="#DCDCDC"
                        title="Cancel" 
                        />
                </Modal>
            </ScrollView>
            
        );
    }

}

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin: 20
    },
    formRowModal: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
      justifyContent: 'center',
      },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        margin: 20
     },
     modalTitle: {
         fontSize: 24,
         fontWeight: 'bold',
         backgroundColor: '#512DA8',
         textAlign: 'center',
         color: 'white',
         marginBottom: 20
     },
     modalText: {
         fontSize: 18,
         margin: 10
     }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);
import React, { Component } from 'react';
import { View, Text, ScrollView, FlatList, Modal, Button, StyleSheet } from 'react-native';
import { Card, Icon, Input, Rating  } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite } from '../redux/ActionCreators';
import { postComment } from '../redux/ActionCreators';

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

    if (dish != null) {
        return (
            <Card
                featuredTitle={dish.name}
                image={{ uri: baseUrl + dish.image }}
                >
                <Text style={{ margin: 10 }}>
                    {dish.description}
                </Text>
                <Icon
                    raised
                    reverse
                    name={props.favorite ? 'heart' : 'heart-o'}
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
                    onPress={() => props.showModal()}
                />
            </Card>
        );
    } else {
        return <View></View>
    }
}

function RenderComments(props) {

    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {

        return (
            <View key={index} style={{ margin: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.comment}</Text>
                <Rating style={{ paddingVertical: 10}} imageSize={10} startingValue={item.rating} readonly='true'/>
                <Text style={{ fontSize: 12 }}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };

    return (
        <Card title='Comments' >
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
            />
        </Card>
    );
}

class Dishdetail extends Component {

        constructor(props) {
        super(props);
        this.state = {
            showCommentsModel: false
        }
    }

    static navigationOptions = {
        title: "Dish Details"
    }

    markFavorite(dishId) {
        console.log('DISH ID ' + dishId);
        this.props.postFavorite(dishId);
    }

    toggleModal=() => {
       this.setState({showCommentsModel: !this.state.showCommentsModel});
    }

    ratingCompleted = (rating) => {
        this.setState({rating: rating});
    }

    authorChange(text) {
        this.setState({author: text});
    }

    commentChange(text) {
        this.setState({comment: text});
    }

    handleComment(){
        const dishId = this.props.navigation.getParam('dishId', '');
        this.setState({dishId, dishId})
        console.log(JSON.stringify(this.state));
        this.props.postComment(this.state.dishId, this.state.rating, this.state.author, this.state.comment);
        this.toggleModal();
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId', '');
        return <ScrollView>
            <RenderDish dish={this.props.dishes.dishes[+dishId]}
                favorite={this.props.favorites.some(el => el === dishId)}
                onPress={() => this.markFavorite(dishId)}
                showModal = {() => this.toggleModal()} 
            />
            <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
            <Modal animationType={'slide'} transparent={false}
                visible={this.state.showCommentsModel}
                onRequestClose={() => this.toggleModal()}>
                <View>
                    <Rating
                        showRating
                        onFinishRating={this.ratingCompleted}
                        startingValue="5"
                    />
                    <View style={{marginBottom:10, margin : 20}}>
                        <Input placeholder='Author' leftIcon={
                            { type: 'font-awesome', name: 'user-o' }
                        } onChangeText={(text) => this.authorChange(text)}/>
                    </View>
                    <View style={{marginBottom:10, margin : 20}}>
                        <Input placeholder='Comment' leftIcon={
                            { type: 'font-awesome', name: 'comment-o' }
                        } onChangeText={(text) => this.commentChange(text)}/>
                        </View>
                    <View style={{marginBottom:10, margin : 20}}>
                        <Button
                            onPress={() => { this.handleComment(); }}
                            color="#512DA8"
                            title="Submit"
                        />
                        </View>
                    <View style={{marginBottom:10, margin : 20}}>
                        <Button
                            onPress={() => { this.toggleModal(); }}
                            color="#A9A9A9"
                            title="Cancel"
                        />
                        </View> 
                </View>
            </Modal>
        </ScrollView>
    }
}

const styles = StyleSheet.create({
    formRow : {
        alignItems : 'center',
        justifyContent : 'center',
        flex : 1,
        flexDirection : 'row',
        margin : 25,
        marginBottom : 10
    },
    formLabel : {
        fontSize:18,
        flex : 2
    },
    formItem : {
        flex : 1
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
})

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);
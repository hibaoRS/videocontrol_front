import InfiniteScroll from "react-infinite-scroll-component";

import React from "react";

export class TestScroll extends React.Component {


    render() {
        return (
            <InfiniteScroll style={{height: "200px", display: "flex", flexDirection: "column"}}>

                <div>test1test1</div>
                <div>test1test1</div>
                <div>test1test1</div>
                <div>test1test1</div>
                <div>test1test1</div>
                <div>test1test1</div>
                <div>test1test1</div>
                <div>test1test1</div>
                <div>test1test1</div>
                <div>test1test1</div>
                <div>test1test1</div>

            </InfiniteScroll>
        );
    }
}
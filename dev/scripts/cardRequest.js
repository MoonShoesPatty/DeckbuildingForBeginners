// ----- AXIOS REQUEST TO HEARTHSTONE API ----- //
import axios from 'axios';

const getCards = function() {
    // axios({
    //     method: 'GET',
    //     url: 'http://proxy.hackeryou.com',
    //     dataResponse: 'json',
    //     //useCache: true,
    //     params: {
    //         reqUrl: 'https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/ragnaros,%20lightlord',
    //         headers: {
    //             'X-Mashape-Key': 'fxIgSodXnmmshLLhawVYFjm6AKy9p1sgwjSjsnhjrIdUCsVwHY'
    //         }
    //     }
    // }).then((res) => {
    //     console.log(res);
    // });
    axios.get('https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/ragnaros,%20lightlord', {
        headers: {
            'X-Mashape-Key': 'fxIgSodXnmmshLLhawVYFjm6AKy9p1sgwjSjsnhjrIdUCsVwHY'
        }
    })
    .then(({data}) => {
        return data;
    })
}

export default getCards;
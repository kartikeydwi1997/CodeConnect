import * as searchDao from './search-dao.js'

const updateSearch = async (req, res) => {
    console.log("updating search", req.params.qid)
    const searchIdToUpdate = req.params.qid;
    const updates = req.body;
    const response = await searchDao.updateSearch(searchIdToUpdate, updates);
    return res.status(201)
}

const createSearch = async (req, res) => {
    const query = req.body;
    const search = await searchDao.findSearchByIdLink(query.question_id, query.link);

    if (!search) {
        const newSearch = await searchDao.createSearch(query.question_id, query.link);
        return res.status(201).json({ status: 201, message: "Search created successfully", newSearch });
    }
    else {
        return res.status(201).json({ status: 201, message: "Search exists" });
    }
}

const getSearch = async (req, res) => {
    const {q_id} = req.params
    const search = await searchDao.findSearchById(q_id);
    console.log("in server", search)
    return res.status(201).json({ status: 201, search });
}

export default (app) => {
    app.put('/api/details/:qid', updateSearch)
    app.post('/api/create-search', createSearch)
    app.get('/api/get-search/:q_id', getSearch)
}
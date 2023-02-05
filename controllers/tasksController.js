exports.getAllTasks =  (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: 'this is a get all tasks route'
    })
}
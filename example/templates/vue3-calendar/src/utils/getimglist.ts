export default (imgArr: string) => {
    let imglist: any = []
    try {
        imglist = imgArr.split(',')


    } catch (error) {
        return []
    }

    return imglist
}
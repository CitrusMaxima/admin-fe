import React from 'react';
import MUtil from 'util/mm.jsx'
import Product from 'service/product-service.jsx'
import PageTitle from 'component/page-title/index.jsx';
import {DatePicker} from 'antd';
import {LocaleProvider} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const {RangePicker} = DatePicker;

import '../index/save.scss';
import './index1.scss';

const _mm = new MUtil();
const _product = new Product();
const disabledDate = (current) => {
    return current && current < moment().endOf('day');
};

class SeckillSave extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.match.params.seckillId,
            name: '',
            subtitle: '',
            categoryId: 0,
            parentCategoryId: 0,
            subImages: [],
            price: '',
            stock: '',
            detail: '',
            status: 1 //商品状态1为在售
        }
    }

    componentDidMount() {
        this.loadProduct();
    }

    // 加载商品详情
    loadProduct() {
        // 有id的时候，表示是编辑功能，需要表单回填
        if (this.state.id) {
            _product.getProduct(this.state.id).then((res) => {
                let images = res.subImages.split(',');
                res.subImages = images.map((imgUri) => {
                    return {
                        uri: imgUri,
                        url: res.imageHost + imgUri
                    }
                });
                res.defaultDetail = res.detail;
                this.setState(res);
            }, (errMsg) => {
                _mm.errorTips(errMsg);
            });
        }
    }

    // 简单字段的改变，比如商品名称，描述，价格，库存
    onValueChange(e) {
        let name = e.target.name,
            value = e.target.value.trim();
        this.setState({
            [name]: value
        });
    }

    // 品类选择器变化
    onCategoryChange(categoryId, parentCategoryId) {
        this.setState({
            categoryId: categoryId,
            parentCategoryId: parentCategoryId
        });
    }

    getSubImagesString() {
        return this.state.subImages.map((image) => image.uri).join(',');
    }

    // 提交表单
    onSubmit() {
        let product = {
                name: this.state.name,
                subtitle: this.state.subtitle,
                categoryId: parseInt(this.state.categoryId),
                subImages: this.getSubImagesString(),
                detail: this.state.detail,
                price: parseFloat(this.state.price),
                stock: parseInt(this.state.stock),
                status: this.state.status
            },
            productCheckResult = _product.checkProduct(product);
        if (this.state.id) {
            product.id = this.state.id;
        }
        // 表单验证成功
        if (productCheckResult.status) {
            _product.saveProduct(product).then((res) => {
                _mm.successTips(res);
                this.props.history.push('/product/index');
            }, (errMsg) => {
                _mm.errorTips(errMsg);
            });
        }
        // 表单验证失败
        else {
            _mm.errorTips(productCheckResult.msg);
        }
    }

    render() {
        return (
            <div id="page-wrapper">
                <PageTitle title={this.state.id ? '编辑秒杀' : '添加秒杀'}/>
                <div className="form-horizontal">
                    <div className="form-group">
                        <label className="col-md-2 control-label">商品ID</label>
                        <div className="col-md-5">
                            <input type="text" className="form-control"
                                   placeholder="请输入商品ID"
                                   name="name"
                                   value={this.state.name}
                                   onChange={(e) => this.onValueChange(e)}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-md-2 control-label">秒杀价</label>
                        <div className="col-md-3">
                            <div className="input-group">
                                <input type="number" className="form-control"
                                       placeholder="价格"
                                       name="price"
                                       value={this.state.price}
                                       onChange={(e) => this.onValueChange(e)}/>
                                <span className="input-group-addon">元</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-md-2 control-label">库存</label>
                        <div className="col-md-3">
                            <div className="input-group">
                                <input type="number" className="form-control"
                                       placeholder="库存"
                                       name="stock"
                                       value={this.state.stock}
                                       onChange={(e) => this.onValueChange(e)}/>
                                <span className="input-group-addon">件</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-md-2 control-label">秒杀时间</label>
                        <div className="col-md-3">
                            <div className="input-group">
                                <LocaleProvider locale={zh_CN}>
                                    <RangePicker
                                        disabledDate={disabledDate}
                                        showTime={{
                                            format: 'HH:mm',
                                            hideDisabledOptions: true,
                                            defaultValue: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')]
                                        }}
                                        format="YYYY-MM-DD HH:mm"
                                        placeholder={['开始时间', '结束时间']}
                                    />
                                </LocaleProvider>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-md-offset-2 col-md-10">
                            <button type="submit" className="btn btn-primary"
                                    onClick={(e) => {
                                        this.onSubmit(e)
                                    }}>提交
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SeckillSave;

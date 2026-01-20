import React, { useContext, useEffect, useState } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { emphasize, styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MyContext } from '../../App';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from '@mui/material/CircularProgress';
import { editData, fetchDataFromApi, postData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { Link, useParams } from "react-router-dom";

//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
});



const EditSubCat = () => {

    const [data, setData] = useState([]);
    const [categoryVal, setcategoryVal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formFields, setFormFields] = useState({
        category: '',
        subCat: '',
    });

    const history = useNavigate();
    const context = useContext(MyContext);

    let { id } = useParams();


    useEffect(()=>{
        fetchDataFromApi(`/api/subCat/${id}`).then((res)=>{
            setData(res);
            setcategoryVal(res.category.id);
            setFormFields(() => ({
                ...formFields,
                category: res.category.id,
                subCat:res.subCat
            }))
        })
    },[]);

    const inputChange = (e) => {
        setFormFields(() => ({
            ...formFields,
            [e.target.name]: e.target.value
        }))
    }

    const handleChangeCategory = (event) => {
        setcategoryVal(event.target.value);
        setFormFields(() => ({
            ...formFields,
            category: event.target.value
        }))
    
    };


    const editSubCat = (e) => {
        e.preventDefault();
        const formdata = new FormData();
        formdata.append('category', formFields.category);
        formdata.append('subCat', formFields.subCat);

        if (formFields.category === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: 'Please select a category'
            });
            return false;
        }

        if (formFields.subCat === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: 'Please enter sub category'
            });
            return false;
        }



        editData(`/api/subCat/${id}`, formFields).then((res) => {
            setIsLoading(false);
            context.fetchCategory();
            context.fetchSubCategory();
            history('/subCategory');
        });

    }

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
                <h5 className="mb-0">Edit Sub Category</h5>
                <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                    <StyledBreadcrumb
                        component="a"
                        href="#"
                        label="Dashboard"
                        icon={<HomeIcon fontSize="small" />}
                    />

                    <StyledBreadcrumb
                        component="a"
                        label="Edit Sub Category"
                        href="#"
                        deleteIcon={<ExpandMoreIcon />}
                    />
                    <StyledBreadcrumb
                        label="Edit Category"
                        deleteIcon={<ExpandMoreIcon />}
                    />
                </Breadcrumbs>
            </div>

            <form className='form' onSubmit={editSubCat}>
                <div className='row'>
                    <div className='col-sm-9'>
                        <div className='card p-4 mt-0'>
                            <div className='row'>
                                <div className='col'>
                                    <div className='form-group'>
                                        <h6>CATEGORY</h6>
                                        <Select
                                            value={categoryVal}
                                            onChange={handleChangeCategory}
                                            displayEmpty
                                            inputProps={{ 'aria-label': 'Without label' }}
                                            className='w-100'
                                            name="category"
                                        >
                                            <MenuItem value="">
                                                <em value={null}>None</em>
                                            </MenuItem>
                                            {
                                                context.catData?.categoryList?.length !== 0 && context.catData?.categoryList?.map((cat, index) => {
                                                    return (
                                                        <MenuItem className="text-capitalize" value={cat.id} key={index}>{cat.name}</MenuItem>
                                                    )
                                                })
                                            }

                                        </Select>
                                    </div>
                                </div>



                                <div className='col'>
                                    <div className='form-group'>
                                        <h6>SUB CATEGORY</h6>
                                        <input type='text' name="subCat" value={formFields.subCat} onChange={inputChange} />
                                    </div>
                                </div>

                            </div>


                            <Button type="submit" className="btn-blue btn-lg btn-big w-100"
                            ><FaCloudUploadAlt /> &nbsp;  {isLoading === true ? <CircularProgress color="inherit" className="loader" /> : 'PUBLISH AND VIEW'}  </Button>

                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditSubCat;
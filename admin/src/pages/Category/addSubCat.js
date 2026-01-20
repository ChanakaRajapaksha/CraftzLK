import React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { emphasize, styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import { useContext, useEffect, useState } from 'react';
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from '@mui/material/Button';
import { deleteData, deleteImages, editData, fetchDataFromApi, postData, uploadImage } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { FaRegImages } from "react-icons/fa";
import { MyContext } from '../../App';

import CircularProgress from '@mui/material/CircularProgress';
import { IoCloseSharp } from "react-icons/io5";

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

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

const AddSubCat = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [catData, setCatData] = useState([]);

    const [categoryVal, setcategoryVal] = useState('');
    
    const [formFields, setFormFields] = useState({
        name: '',
        slug:'',
        parentId:''
    });


    const formdata = new FormData();

    const history = useNavigate();

    const context = useContext(MyContext);

    useEffect(()=>{
        fetchDataFromApi('/api/category').then((res) => {
            setCatData(res);
            context.setProgress(100);
          })
    },[])

    const changeInput = (e) => {
        setFormFields(() => (
            {
                ...formFields,
                [e.target.name]: e.target.value
            }
        ))
    }


    const handleChangeCategory = (event) => {
        setcategoryVal(event.target.value);
    };


    const selectCat = (cat,id) => {
        formFields.parentId = id;
    }


    const addSubCategory = (e) => {
        e.preventDefault();

        console.log(formFields)

        formFields.slug = formFields.name

        if (formFields.name !== "" && formFields.parentId!=="") {
            setIsLoading(true);

            postData(`/api/category/create`, formFields).then((res) => {
                // console.log(res);
                setIsLoading(false);
                context.fetchCategory();
            

                deleteData("/api/imageUpload/deleteAllImages");

                history('/subCategory');
            });

        }

        else {
            context.setAlertBox({
                open: true,
                error: true,
                msg: 'Please fill all the details'
            });
            return false;
        }

    }

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
                    <h5 className="mb-0">Add Sub Category</h5>
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                        />

                        <StyledBreadcrumb
                            component="a"
                            label="Category"
                            href="#"
                            deleteIcon={<ExpandMoreIcon />}
                        />
                        <StyledBreadcrumb
                            label="Add Sub Category"
                            deleteIcon={<ExpandMoreIcon />}
                        />
                    </Breadcrumbs>
                </div>

                <form className='form' onSubmit={addSubCategory}>
                    <div className='row'>
                        <div className='col-sm-9'>
                            <div className='card p-4 mt-0'>

                                <div className='form-group'>
                                    <h6>Parent Category</h6>
                                    <Select
                                                value={categoryVal}
                                                onChange={handleChangeCategory}
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                className='w-100'
                                            >
                                                <MenuItem value="">
                                                    <em value={null}>None</em>
                                                </MenuItem>
                                                {
                                                    catData?.categoryList?.length !== 0 && catData?.categoryList?.map((cat, index) => {
                                                        return (
                                                            <MenuItem className="text-capitalize" value={cat._id} key={index}
                                                                onClick={() => selectCat(cat.name,cat._id)}
                                                            >{cat.name}</MenuItem>
                                                        )
                                                    })
                                                }

                                            </Select>
                                </div>



                                <div className='form-group'>
                                    <h6>Sub Category</h6>
                                    <input type='text' name='name' value={formFields.name} onChange={changeInput} />
                                </div>

                                <br />

                                <Button type="submit" className="btn-blue btn-lg btn-big w-100"
                                ><FaCloudUploadAlt /> &nbsp;  {isLoading === true ? <CircularProgress color="inherit" className="loader" /> : 'PUBLISH AND VIEW'}  </Button>

                            </div>
                        </div>


                    </div>
                </form>

            </div>
        </>
    )
}

export default AddSubCat;
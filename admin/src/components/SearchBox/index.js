import { useRef } from "react";
import { IoSearch } from "react-icons/io5";


const SearchBox = (props)=>{

    const searchInput = useRef();

    const searchProducts=()=>{
        props.searchProducts(searchInput.current.value);
    }

    return(
        <div className="searchBox posotion-relative d-flex align-items-center">
            <IoSearch className="mr-2"/>
            <input type="text" placeholder="Search here..." ref={searchInput} onChange={searchProducts}/>
        </div>
    )
}

export default SearchBox;
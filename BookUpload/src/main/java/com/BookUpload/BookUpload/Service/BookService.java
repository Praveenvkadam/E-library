package com.BookUpload.BookUpload.Service;

import com.BookUpload.BookUpload.DTO.BookRequest;
import com.BookUpload.BookUpload.DTO.BookResponce;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

public interface BookService {

    BookResponce BookUpload(BookRequest bookRequest, MultipartFile imageFile, MultipartFile pdfFile);

    BookResponce BookDelete(Long bookId);

    BookResponce BookUpdate(Long bookId, BookRequest bookRequest, MultipartFile imageFile, MultipartFile pdfFile);

    List<BookResponce> findAll();

    List<BookResponce> searchBooks(String B_name, String B_author, Date releaseDate, String B_Category,String B_Language);
}
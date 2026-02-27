package com.BookUpload.BookUpload.Controller;

import com.BookUpload.BookUpload.DTO.BookRequest;
import com.BookUpload.BookUpload.DTO.BookResponce;
import com.BookUpload.BookUpload.Service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;


    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponce> uploadBook(
            @RequestPart("bookName")        String B_name,
            @RequestPart("bookAuthor")      String B_author,
            @RequestPart("bookDescription") String B_description,
            @RequestPart("releaseDate")     String releaseDate,
            @RequestPart("bookCategory")    String B_Category,
            @RequestPart("bookLanguage")    String B_Language,
            @RequestPart("imageFile")       MultipartFile imageFile,
            @RequestPart("pdfFile")         MultipartFile pdfFile
    ) {
        try {
            Date parsedDate = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(releaseDate);
            BookRequest bookRequest = new BookRequest(
                    B_name, B_author, B_description,
                    null, null,
                    parsedDate, B_Category, B_Language
            );
            BookResponce response = bookService.BookUpload(bookRequest, imageFile, pdfFile);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping
    public ResponseEntity<List<BookResponce>> getAllBooks() {
        try {
            List<BookResponce> books = bookService.findAll();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/search")
    public ResponseEntity<List<BookResponce>> searchBooks(
            @RequestParam(required = false) String B_name,
            @RequestParam(required = false) String B_author,
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM-dd") Date releaseDate,
            @RequestParam(required = false) String B_Category ,
            @RequestParam(required = false) String B_Language
    ) {
        try {

            List<BookResponce> books = bookService.searchBooks(B_name, B_author, releaseDate, B_Category,B_Language);
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponce> updateBook(
            @PathVariable Long id,
            @RequestPart("bookName")        String B_name,
            @RequestPart("bookAuthor")      String B_author,
            @RequestPart("bookDescription") String B_description,
            @RequestPart("releaseDate")     String releaseDate,
            @RequestPart("bookCategory")    String B_Category,
            @RequestPart("bookLanguage")    String B_Language,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestPart(value = "pdfFile",   required = false) MultipartFile pdfFile
    ) {
        try {
            Date parsedDate = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(releaseDate);
            BookRequest bookRequest = new BookRequest(
                    B_name, B_author, B_description,
                    null, null,
                    parsedDate, B_Category, B_Language
            );
            BookResponce response = bookService.BookUpdate(id, bookRequest, imageFile, pdfFile);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<BookResponce> deleteBook(@PathVariable Long id) {
        try {
            BookResponce response = bookService.BookDelete(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
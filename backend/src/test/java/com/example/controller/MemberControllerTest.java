package com.example.controller;

import com.example.model.Member;
import com.example.service.MemberService;
import com.example.service.ConferenceService;
import com.example.researchgroup.ResearchGroupBackendApplication;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = ResearchGroupBackendApplication.class)
@AutoConfigureMockMvc
public class MemberControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MemberService memberService;

    @MockBean
    private ConferenceService conferenceService;

    private static final String UPLOAD_DIR = "uploads/";

    @BeforeEach
    public void setup() {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
    }

    @AfterEach
    public void tearDown() {
        // Clean up uploads directory
        try (Stream<Path> files = Files.walk(Path.of(UPLOAD_DIR))) {
            files.filter(Files::isRegularFile)
                 .map(Path::toFile)
                 .forEach(File::delete);
        } catch (IOException e) {
            System.err.println("Failed to clean up uploads directory: " + e.getMessage());
        }
    }

    @Test
    public void testUploadPhoto_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        when(memberService.updateMemberPhoto(eq(1L), any(String.class))).thenReturn(new Member());

        mockMvc.perform(multipart("/api/members/1/upload-photo")
                .file(file))
                .andExpect(status().isOk());
    }

    @Test
    public void testUploadPhoto_InvalidFileType() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "text content".getBytes()
        );

        mockMvc.perform(multipart("/api/members/1/upload-photo")
                .file(file))
                .andExpect(status().isBadRequest());
    }
}

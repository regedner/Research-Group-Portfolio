package com.example.controller;

import com.example.model.Member;
import com.example.service.MemberService;
import com.example.service.ConferenceService;
import com.example.researchgroup.ResearchGroupBackendApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.h2.H2ConsoleAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Switched to full SpringBootTest as WebMvcTest is struggling with context configuration likely due to missing beans or scan issues
@SpringBootTest(classes = ResearchGroupBackendApplication.class)
@AutoConfigureMockMvc
class MemberControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MemberService memberService;

    @MockBean
    private ConferenceService conferenceService;

    @Test
    void uploadPhoto_ShouldSucceedWithValidImage() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A} // Valid PNG magic bytes
        );

        when(memberService.updateMemberPhoto(eq(1L), any(String.class))).thenReturn(new Member());

        mockMvc.perform(multipart("/api/members/1/upload-photo").file(file))
                .andExpect(status().isOk());
    }

    @Test
    void uploadPhoto_ShouldFailWithInvalidExtensionButCorrectContentType() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "malicious.html",
                "image/png", // Fake content type
                "<html><script>alert(1)</script></html>".getBytes() // Malicious content
        );

        // Before fix: This expects Ok (200) because it trusts the content type.
        // After fix: This should expect BadRequest (400) because magic bytes don't match.

        // I want this test to FAIL initially (proving vulnerability, or rather proving the test works as a regression test)
        // If I write isBadRequest(), it will fail (get 200).
        // Then I fix code, it will pass (get 400).

        mockMvc.perform(multipart("/api/members/1/upload-photo").file(file))
                .andExpect(status().isBadRequest());
    }
}

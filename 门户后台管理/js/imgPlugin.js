(function(jQuery) {
	var imageNum = 5;
	if (jQuery("#maxImageNum").val() != null) {
		imageNum = jQuery("#maxImageNum").val();
	}
    var delParent;

	jQuery.fn.extend({
				takungaeImgup : function(opt, serverCallBack) {
					if (typeof opt != "object") {
						alert('参数错误!');
						return;
					}

					var jQueryfileInput = jQuery(this);
					var jQueryfileInputId = jQueryfileInput.attr('id');

					var defaults = {
						fileType : [ "jpg", "png", "bmp", "jpeg","JPG","PNG","JPEG","BMP" ], // 上传文件的类型
						fileSize : 1024 * 1024 * 10, // 上传文件的大小 10M
						count : 0
					// 计数器
					};

					// 组装参数;

					if (opt.success) {
						var successCallBack = opt.success;
						delete opt.success;
					}

					if (opt.error) {
						var errorCallBack = opt.error;
						delete opt.error;
					}

					/* 点击图片的文本框 */
					jQuery(this).change(function() {
						var reader = new FileReader(); // 新建一个FileReader();
						var idFile = jQuery(this).attr("id");
						var file = document.getElementById(idFile);
						var imgContainer = jQuery(this).parents(".z_photo"); // 存放图片的父亲元素
						var fileList = file.files; // 获取的图片文件
						var input = jQuery(this).parent();// 文本框的父亲元素
						var imgArr = [];
						// 遍历得到的图片文件
						var numUp = imgContainer.find(".up-section").length;
						var totalNum = numUp + fileList.length; // 总的数量
						if (fileList.length > imageNum|| totalNum > imageNum) {
							alert("上传图片数目不可以超过5个，请重新选择"); // 一次选择上传超过5个
							// 或者是已经上传和这次上传的到的总数也不可以超过5个
						} else if (numUp < imageNum) {
							fileList = validateUp(fileList,defaults);
							for ( var i = 0; i < fileList.length; i++) {
								var imgUrl = window.URL.createObjectURL(fileList[i]);
								imgArr.push(imgUrl);
								var jQuerysection = jQuery("<section class='up-section fl loading'>");
								imgContainer.children(".z_file").before(jQuerysection);
								var jQueryspan = jQuery("<span class='up-span'>");
								jQueryspan.appendTo(jQuerysection);
								var jQueryimg0 = jQuery("<img class='close-upimg'>").on("click",function(event){
											    event.preventDefault();
												event.stopPropagation();
												jQuery(".works-mask").show();
												delParent = jQuery(this).parent();
								});
								jQueryimg0.attr("src","images/a7.png").appendTo(jQuerysection);
								var jQueryimg = jQuery("<img class='up-img up-opcity'>");
								jQueryimg.attr("src", imgArr[i]);
								jQueryimg.appendTo(jQuerysection);
								var jQueryp = jQuery("<p class='img-name-p'>");
								jQueryp.html(fileList[i].name).appendTo(jQuerysection);
                                var jQueryinput = jQuery("<input id='taglocation' name='taglocation' value='' type='hidden'>");
						        jQueryinput.appendTo(jQuerysection);
						        var jQueryinput2 = jQuery("<input id='tags' name='tags' value='' type='hidden'/>");
						        jQueryinput2.appendTo(jQuerysection);
								uploadImg(opt, fileList[i],jQuerysection);
							}
							;
						}

						numUp = imgContainer.find(".up-section").length;
						if (numUp >= imageNum) {
							jQuery(this).parent().hide();
						}
						;
						//input内容清空
						jQuery(this).val("");
					});


					jQuery(".z_photo").delegate(".close-upimg", "click", function(event) {
						event.preventDefault();
						event.stopPropagation();
						jQuery(".works-mask").show();
						delParent = jQuery(this).parent();
						console.log(delParent.html()+"delegzat=======");
					});

					jQuery(".wsdel-ok").click(function(event) {
						event.preventDefault();
						event.stopPropagation();
						jQuery(".works-mask").hide();
						var numUp = delParent.siblings(".up-section").length;
						if (numUp < imageNum + 1) {
							delParent.parent().find(".z_file").show();
						}
						delParent.remove();
					});

					jQuery(".wsdel-no").click(function() {
						jQuery(".works-mask").hide();
					});

					// 验证文件的合法性
					function validateUp(files, defaults) {
						var arrFiles = [];// 替换的文件数组
						for ( var i = 0, file; file = files[i]; i++) {
							// 获取文件上传的后缀名
							var newStr = file.name.split("").reverse().join("");
							if (newStr.split(".")[0] != null) {
								var type = newStr.split(".")[0].split("")
										.reverse().join("");
								console.log(type + "===type===");
								if (jQuery.inArray(type, defaults.fileType) > -1) {
									// 类型符合，可以上传
									if (file.size >= defaults.fileSize) {
										alert('文件大小"' + file.name + '"超出10M限制！');
									} else {
										arrFiles.push(file);
									}
								} else {
									alert('您上传的"' + file.name + '"不符合上传类型');
								}
							} else {
								alert('您上传的"' + file.name + '"无法识别类型');
							}
						}
						return arrFiles;
					}
					;

					function uploadImg(opt, file, obj) {
						jQuery("#imguploadFinish").val(false);
						// 验证通过图片异步上传
						var url = opt.url;
						var data = new FormData();
						data.append("path", opt.formData.path);
						data.append("file", file);
						jQuery.ajax({
							type : 'POST',
							url : url,
							data : data,
							processData : false,
							contentType : false,
							dataType : 'json',
							success : function(data) {
								console.log("chenggong");
								// obj.remove();
								// 上传成功
								if (data.error == 0) {
									jQuery(".up-section").removeClass("loading");
									jQuery(".up-img").removeClass(
											"up-opcity");
									jQuery("#imguploadFinish").val(true);
									var htmlStr = "<input type='text' style='display:none;' name='"
											+ opt.formData.name
											+ "' value='"
											+ data.url
											+ "'>";
									obj.append(htmlStr);
									if (successCallBack) {
										successCallBack(data);
									}
								}

								if (data.error == 1) {
									obj.remove();
									jQuery("#imguploadFinish").val(false);
									if (errorCallBack) {
										errorCallBack(data.url);
									}
								}
							},
							error : function(e) {
								obj.remove();
								var err = "上传失败，请联系管理员！";
								jQuery("#imguploadFinish").val(false);
								if (errorCallBack) {
									errorCallBack(err);
								}
							}
						});
					}

				}
			});

})(jQuery);
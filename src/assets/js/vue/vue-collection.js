if ($('#vue-collection').length) {

var vueCollection = new Vue({

    delimiters: ['${', '}'],    

    el: '#vue-collection',

    name: 'VueCollection',

    data: {

        products: [],

        sortedProducts: [],

        gridImageSrcsets: {},

        sizeFilters: [],

        sizeAscTitle: {
            'xs': 'Extra Small',
            's': 'Small',
            'm': 'Medium',
            'l': 'Large',
            'xl': 'Extra Large',
            'xxl': 'XX Large',
            '0x': 'XX Large',
            '1x': '1X Large',
            '2x': '2X Large',
            '3x': '3X Large',
        },

        colorFilters: [],

        sortOrder: 'best-selling',   

        visibleProducts: 40,

        seeMoreCount: 40,

        panelLayout: false,

        windowWidth: 0
    },  
 
    mounted() {
        this.loadInitialData();
        this.setWindowWidth();
    },

    computed: {

        filteredProducts() {
            return this.sortedProducts.filter(this.isFilteredProduct)
        },
    },

    methods: {

        updateAnimation() {
            var controller = new ScrollMagic.Controller();
            var collectionScrollMagic

            if (this.windowWidth >= 768) {
                Vue.nextTick(function () {
                    // console.log('UPDATE')
                    // console.log($('.c-colGrid').outerHeight() - $('.js-animTrigger__collectionSidebarSection').height())

                    var duration = ($('.c-colGrid').outerHeight() + $('.c-colToolbar').outerHeight()) - $('.js-animTrigger__collectionSidebarSection').height();
                    var delayedDuration

                    // console.log('UPDATE Original')
                    // console.log('duration', duration)
                    // console.log('delayedDuration', delayedDuration)   

                    function initCollectionScrollMagic(durationValue) {
                        window.collectionScrollMagic = new ScrollMagic.Scene({
                            triggerHook: 0,
                            offset: 0,
                            triggerElement: '.js-animTrigger__collectionSidebarSection',
                            // duration: $('.js-animElement__collectionLowerWrap').outerHeight()
                            duration: durationValue
                        })
                        .setPin('.js-animTrigger__collectionSidebarSection', {pushFollowers: false}) // default true
                        // .addIndicators()
                        .addTo(controller);                    
                    }  

                    function destoryCollectionScrollMagic() {
                        controller = controller.destroy(true);                
                    }

                    if (duration > 0) {
                        if (window.collectionScrollMagic) {
                            window.collectionScrollMagic.duration(duration)
                        } else { 
                            // console.log('no scroll magic original init')
                            initCollectionScrollMagic(duration) 
                        }
                    } else {
                        if (window.collectionScrollMagic) {
                            // console.log('negative original - destory')
                            destoryCollectionScrollMagic()
                        } else { 
                            // console.log('no scene destory - initial')
                        }
                    }

                    setTimeout(function() {
                        delayedDuration = ($('.c-colGrid').outerHeight() + $('.c-colToolbar').outerHeight()) - $('.js-animTrigger__collectionSidebarSection').height();
                        // console.log('UPDATE TIMEOUT')
                        // console.log('duration', duration)
                        // console.log('delayedDuration', delayedDuration)                    

                        if (delayedDuration > 0) {
                            if (window.collectionScrollMagic) {
                                window.collectionScrollMagic.duration(delayedDuration)
                            } else { 
                                // console.log('no scroll magic init timeout')
                                initCollectionScrollMagic(delayedDuration) 
                            }

                        } else {
                            if (collectionScrollMagic) {
                                destoryCollectionScrollMagic()
                            } else { 
                                // console.log('no scene destroy - timeout') 
                            }
                        }
                    }, 1000)                       
                })
            }        
        },

        isFilteredProduct(product) {
            let includesAllColors = false
            let includesAllSizes = true
            let variantIndex

            if (this.colorFilters.length) {
                this.colorFilters.forEach(function(tag) {
                    if (product.tags.includes(`color-${tag}`)) {
                        includesAllColors = true
                        return
                    }
                })
            } else {
                includesAllColors = true
            }

            // EXIT if colors didn't pass
            if (!includesAllColors) { return false }


            if (this.sizeFilters.length) {
                this.sizeFilters.forEach(function(size){

                    if (!product.options[1].values.includes(size)) {
                        includesAllSizes = false
                        return
                    } else {
                        // has size on product
                        variantIndex = product.options[1].values.indexOf(size)

                        if (!product.variants[variantIndex].available) {
                            // size isn't available on product
                            includesAllSizes = false
                            return
                        }
                    }
                })
            }

            // already checked for colors with the EXIT
            return (includesAllSizes)
        },        

        clearAllFilters() {
            this.sizeFilters = []
            this.colorFilters = []

            this.updateAnimation()
        },

        productAvailable(product) {
            let productAvailable = false

            product.variants.forEach(function(variant) {
                if (variant.available === true) {
                    productAvailable = true
                    return
                }
            })
            return productAvailable
        },

        compareAtPrice(product) {
            let compareAtPrice

            product.variants.forEach(function(variant) {
                if (variant.compare_at_price !== null) {
                    compareAtPrice = variant.compare_at_price
                    return
                }
            })
            return (compareAtPrice) ? compareAtPrice : false
        },

        productPrice(product) {
            return product.variants[0].price
        },        

        toggleSizeFilter(filter) {
            // remove if already set
            if (this.sizeFilters.includes(filter)) {
                let index = this.sizeFilters.indexOf(filter);
                this.sizeFilters.splice(index, 1)
            } 

            // add if not already set
            else {
                this.sizeFilters.push(filter)
            }

            if (this.windowWidth < 768) {
                setTimeout(function() {
                    $('#category-filter-mobile .js-modal-close').trigger('click')
                }, 300)                
            }

            this.updateAnimation()
        },

        toggleColorFilter(filter) {
            // remove if already set
            if (this.colorFilters.includes(filter)) {
                let index = this.colorFilters.indexOf(filter)
                this.colorFilters.splice(index, 1)
            } 

            // add if not already set
            else {
                this.colorFilters.push(filter)
            }

            if (this.windowWidth < 768) {
                setTimeout(function() {
                    $('#category-filter-mobile .js-modal-close').trigger('click')
                }, 300)                
            }    

            this.updateAnimation()        
        },

        isActiveFilter(filterType, filter) {
            let filterTypeToCheck = `${filterType}Filters`
            if (this[filterTypeToCheck].includes(filter)) {
                return true
            }

            else {
                return false
            }
        },

        setGridLayout(viewType) {

            console.log('set grid layout')
            var vm = this

            if (viewType === 'panel') {
                this.panelLayout = true
                // if (this.visibleProducts <= 12) {
                //     this.visibleProducts = 12
                // }
                this.seeMoreCount = 20

                Vue.nextTick(function() {
                    vm.updateAnimation()
                })
            } else {
                this.panelLayout = false
                // if (this.visibleProducts <= 40) {
                //     this.visibleProducts = 40
                // }
                this.seeMoreCount = 40

                Vue.nextTick(function() {
                    vm.updateAnimation()
                })
            }
        },

        seeMoreProducts() {
            this.visibleProducts = this.visibleProducts + this.seeMoreCount
            this.updateAnimation()
        },

        sizeTitle(size) {
            let sizeTitle = size.toLowerCase()
            return this.sizeAscTitle[sizeTitle]
        },

        ascendingSort(array) {
            var clonedArray = array.slice(0);

            return clonedArray.sort(function(a, b) {
                return a.variants[0].price - b.variants[0].price
            })
        },

        descendingSort(array) {
            var clonedArray = array.slice(0);

            return clonedArray.sort(function(a, b) {
                return b.variants[0].price - a.variants[0].price
            })
        },

        originalSort(array) {
            var clonedArray = array.slice(0);

            return clonedArray
        },        

        loadInitialData() {
            var productsData;
            const vm = this;
     
            $.ajax({
                type: "GET",
                url: collectionUrl + '/products.json?limit=250"',
                dataType: "json",
                success : function(data) {
                    data = data;
                    vm.products = data.products;
                    vm.sortedProducts = vm.originalSort(data.products)

                    vm.updateAnimation()
                }
            });  
        },

        setSortOrder(sortOrder) {
            let sortOrderText

            if (sortOrder == 'price-ascending') {
                sortOrderText = 'Price Low to High'
                this.sortOrder = 'price-ascending'
                this.sortedProducts = this.ascendingSort(this.products)
            } else if (sortOrder == 'price-descending') {
                sortOrderText = 'Price High to Low'
                this.sortOrder = 'price-descending'
                this.sortedProducts = this.descendingSort(this.products)
            } else {
                sortOrderText = 'Best Selling'
                this.sortOrder = 'best-selling'
                this.sortedProducts = this.originalSort(this.products)
            }

            $('.js-current-sort-text').text(sortOrderText)
            $('.js-sort-container').toggleClass('is-open')
            $('.js-sort-dropdown').toggleClass('is-open')

            if (this.windowWidth < 768) {
                setTimeout(function() {
                    $('#category-sort-mobile .js-modal-close').trigger('click')
                }, 300)
            }            
        },

        setWindowWidth() {
            this.windowWidth = document.documentElement.clientWidth
        },        
    }
});

}

